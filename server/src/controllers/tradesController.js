const prisma = require('../db');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;
const { startOfMonth, endOfMonth } = require('date-fns');
const aiService = require('../services/aiService');
const { parseCsvToRecords } = require('../utils/csv');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FREE_TIER_MONTHLY_LIMIT = 5;

async function listTrades(req, res, next) {
  try {
    const {
      accountId,
      market,
      session,
      result,
      dateFrom,
      dateTo,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const where = { userId: req.user.id };
    if (accountId) where.accountId = accountId;
    if (market) where.market = market;
    if (session) where.session = session;
    if (result) where.result = result;
    if (dateFrom || dateTo) {
      where.dateTime = {};
      if (dateFrom) where.dateTime.gte = new Date(dateFrom);
      if (dateTo) where.dateTime.lte = new Date(dateTo);
    }

    const [total, trades] = await Promise.all([
      prisma.trade.count({ where }),
      prisma.trade.findMany({
        where,
        orderBy: { dateTime: 'desc' },
        skip,
        take: pageSize,
        include: { account: { select: { id: true, name: true } } },
      }),
    ]);

    return res.json({
      trades,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function createTrade(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Free tier check: max 5 trades per month
    if (req.user.tier === 'FREE') {
      const now = new Date();
      const count = await prisma.trade.count({
        where: {
          userId: req.user.id,
          createdAt: {
            gte: startOfMonth(now),
            lte: endOfMonth(now),
          },
        },
      });
      if (count >= FREE_TIER_MONTHLY_LIMIT) {
        return res.status(403).json({
          error: `Free tier limit reached: ${FREE_TIER_MONTHLY_LIMIT} trades per month. Upgrade to PRO for unlimited trades.`,
        });
      }
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: req.body.accountId, userId: req.user.id },
    });
    if (!account) {
      return res.status(400).json({ error: 'Invalid account' });
    }

    const {
      accountId,
      dateTime,
      market,
      session,
      direction,
      dailyBias,
      ifvgTimeframe,
      setupGrade,
      confirmation1,
      confirmation2,
      entryPrice,
      slPrice,
      slType,
      tpPrice,
      contracts,
      rrTarget,
      exitPrice,
      result,
      rrAchieved,
      pnl,
      ruleViolation,
      violationDescription,
      wentWell,
      toImprove,
      notes,
      psychologyScore,
      killzoneConfirmed,
      isPublic,
    } = req.body;

    const trade = await prisma.trade.create({
      data: {
        userId: req.user.id,
        accountId,
        dateTime: new Date(dateTime),
        market,
        session,
        direction,
        dailyBias,
        ifvgTimeframe,
        setupGrade,
        confirmation1,
        confirmation2,
        entryPrice: Number(entryPrice),
        slPrice: Number(slPrice),
        slType,
        tpPrice: tpPrice != null ? Number(tpPrice) : undefined,
        contracts: contracts != null ? Number(contracts) : 1,
        rrTarget: rrTarget != null ? Number(rrTarget) : undefined,
        exitPrice: exitPrice != null ? Number(exitPrice) : undefined,
        result,
        rrAchieved: rrAchieved != null ? Number(rrAchieved) : undefined,
        pnl: pnl != null ? Number(pnl) : undefined,
        ruleViolation: ruleViolation === true || ruleViolation === 'true',
        violationDescription,
        wentWell,
        toImprove,
        notes,
        psychologyScore: psychologyScore != null ? Number(psychologyScore) : undefined,
        killzoneConfirmed: killzoneConfirmed === true || killzoneConfirmed === 'true',
        isPublic: isPublic === true || isPublic === 'true',
      },
      include: { account: { select: { id: true, name: true } } },
    });

    return res.status(201).json({ trade });
  } catch (err) {
    next(err);
  }
}

async function getTrade(req, res, next) {
  try {
    const trade = await prisma.trade.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        account: { select: { id: true, name: true } },
        reflections: true,
      },
    });
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    return res.json({ trade });
  } catch (err) {
    next(err);
  }
}

async function updateTrade(req, res, next) {
  try {
    const existing = await prisma.trade.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    const allowed = [
      'dateTime',
      'market',
      'session',
      'direction',
      'dailyBias',
      'ifvgTimeframe',
      'setupGrade',
      'confirmation1',
      'confirmation2',
      'entryPrice',
      'slPrice',
      'slType',
      'tpPrice',
      'contracts',
      'rrTarget',
      'exitPrice',
      'result',
      'rrAchieved',
      'pnl',
      'ruleViolation',
      'violationDescription',
      'wentWell',
      'toImprove',
      'notes',
      'psychologyScore',
      'killzoneConfirmed',
      'isPublic',
    ];

    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (['entryPrice', 'slPrice', 'tpPrice', 'contracts', 'rrTarget', 'exitPrice', 'rrAchieved', 'pnl', 'psychologyScore'].includes(key)) {
          data[key] = Number(req.body[key]);
        } else if (key === 'dateTime') {
          data[key] = new Date(req.body[key]);
        } else if (['ruleViolation', 'killzoneConfirmed', 'isPublic'].includes(key)) {
          data[key] = req.body[key] === true || req.body[key] === 'true';
        } else {
          data[key] = req.body[key];
        }
      }
    }

    const trade = await prisma.trade.update({
      where: { id: req.params.id },
      data,
      include: { account: { select: { id: true, name: true } } },
    });

    return res.json({ trade });
  } catch (err) {
    next(err);
  }
}

async function deleteTrade(req, res, next) {
  try {
    const existing = await prisma.trade.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    await prisma.trade.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Trade deleted' });
  } catch (err) {
    next(err);
  }
}

async function uploadScreenshot(req, res, next) {
  try {
    const trade = await prisma.trade.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `tradeedge/trades/${req.user.id}`,
          public_id: `trade_${req.params.id}`,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const updated = await prisma.trade.update({
      where: { id: req.params.id },
      data: { screenshotUrl: result.secure_url },
    });

    return res.json({ screenshotUrl: updated.screenshotUrl });
  } catch (err) {
    next(err);
  }
}

async function exportCsv(req, res, next) {
  try {
    const trades = await prisma.trade.findMany({
      where: { userId: req.user.id },
      orderBy: { dateTime: 'desc' },
      include: { account: { select: { name: true } } },
    });

    const headers = [
      'id',
      'date',
      'account',
      'market',
      'session',
      'direction',
      'dailyBias',
      'setupGrade',
      'entryPrice',
      'slPrice',
      'tpPrice',
      'exitPrice',
      'contracts',
      'rrTarget',
      'rrAchieved',
      'pnl',
      'result',
      'ruleViolation',
      'psychologyScore',
      'killzoneConfirmed',
      'wentWell',
      'toImprove',
      'notes',
    ];

    const escape = (val) => {
      if (val == null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = trades.map((t) =>
      [
        t.id,
        t.dateTime.toISOString(),
        t.account?.name || '',
        t.market,
        t.session,
        t.direction,
        t.dailyBias,
        t.setupGrade,
        t.entryPrice,
        t.slPrice,
        t.tpPrice ?? '',
        t.exitPrice ?? '',
        t.contracts,
        t.rrTarget ?? '',
        t.rrAchieved ?? '',
        t.pnl ?? '',
        t.result ?? '',
        t.ruleViolation,
        t.psychologyScore ?? '',
        t.killzoneConfirmed,
        t.wentWell ?? '',
        t.toImprove ?? '',
        t.notes ?? '',
      ]
        .map(escape)
        .join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tradeedge-trades.csv"');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
}

async function analyzeScreenshot(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!aiService.isConfigured()) {
      return res.status(503).json({ error: 'AI features are not configured. Add ANTHROPIC_API_KEY to enable screenshot analysis.' });
    }

    const fields = await aiService.analyzeScreenshot(req.file.buffer, req.file.mimetype);
    return res.json({ fields });
  } catch (err) {
    if (err.code === 'AI_NOT_CONFIGURED') {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
}

async function rateTrade(req, res, next) {
  try {
    const trade = await prisma.trade.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    const { ratingType, selfRating } = req.body;

    if (ratingType === 'SELF') {
      const rating = Number(selfRating);
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'selfRating must be a number between 1 and 5' });
      }
      const updated = await prisma.trade.update({
        where: { id: req.params.id },
        data: { ratingType: 'SELF', selfRating: rating, aiRating: null, aiFeedback: null },
      });
      return res.json({ trade: updated });
    }

    if (ratingType === 'AI') {
      if (!aiService.isConfigured()) {
        return res.status(503).json({ error: 'AI features are not configured. Add ANTHROPIC_API_KEY to enable AI trade ratings.' });
      }

      let buffer = null;
      let mimetype = null;
      if (trade.screenshotUrl) {
        try {
          const response = await fetch(trade.screenshotUrl);
          if (response.ok) {
            buffer = Buffer.from(await response.arrayBuffer());
            mimetype = response.headers.get('content-type') || 'image/png';
          }
        } catch {
          // Continue without the screenshot if it can't be fetched
        }
      }

      const { rating, feedback } = await aiService.rateTrade(trade, buffer, mimetype);
      const updated = await prisma.trade.update({
        where: { id: req.params.id },
        data: { ratingType: 'AI', aiRating: rating, aiFeedback: feedback, selfRating: null },
      });
      return res.json({ trade: updated });
    }

    return res.status(400).json({ error: 'ratingType must be SELF or AI' });
  } catch (err) {
    if (err.code === 'AI_NOT_CONFIGURED') {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
}

// Best-effort mapping of common broker CSV exports to TradeEdge trade fields.
function mapCsvRecordToTrade(record, fallbackAccountId) {
  const get = (...aliases) => record.get(...aliases);

  // --- Date/time ---
  const rawDate = get('dateTime', 'date', 'date/time', 'open time', 'opened', 'time', 'entry time', 'entry date');
  let dateTime = rawDate ? new Date(rawDate) : null;
  if (!dateTime || isNaN(dateTime.getTime())) dateTime = new Date();

  // --- Direction ---
  const rawDirection = (get('direction', 'side', 'type', 'action', 'buy/sell', 'position') || '').toLowerCase();
  let direction = 'LONG';
  if (['sell', 'short', 's'].includes(rawDirection)) direction = 'SHORT';
  else if (['buy', 'long', 'b'].includes(rawDirection)) direction = 'LONG';

  // --- Market / symbol ---
  const rawSymbol = (get('market', 'symbol', 'instrument', 'ticker', 'product') || '').toUpperCase();
  let market = 'NQ';
  if (rawSymbol.includes('ES')) market = 'ES';
  else if (rawSymbol.includes('NQ')) market = 'NQ';

  // --- Prices ---
  const toNum = (val) => {
    if (val == null) return undefined;
    const cleaned = String(val).replace(/[^0-9.\-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  };

  const entryPrice = toNum(get('entryPrice', 'entry price', 'open price', 'entry', 'price', 'fill price'));
  const exitPrice = toNum(get('exitPrice', 'exit price', 'close price', 'exit'));
  let slPrice = toNum(get('slPrice', 'stop loss', 'stop-loss', 'sl', 'stoploss price'));
  const tpPrice = toNum(get('tpPrice', 'take profit', 'take-profit', 'tp', 'target price'));
  const contracts = toNum(get('contracts', 'quantity', 'qty', 'size', 'lots', 'volume')) || 1;
  const pnl = toNum(get('pnl', 'profit', 'p/l', 'pl', 'net profit', 'net p/l', 'profit/loss', 'realized p/l'));
  const rrAchieved = toNum(get('rrAchieved', 'rr', 'r multiple', 'r-multiple', 'risk reward'));

  // entryPrice/slPrice are required by the schema — fall back to sensible defaults
  const safeEntryPrice = entryPrice != null ? entryPrice : 0;
  if (slPrice == null) {
    // No stop-loss data in broker export — default to entry price (0 risk recorded)
    slPrice = safeEntryPrice;
  }

  // --- Result ---
  let result;
  const rawResult = (get('result', 'outcome', 'win/loss') || '').toLowerCase();
  if (['win', 'w', 'won'].includes(rawResult)) result = 'WIN';
  else if (['loss', 'l', 'lost'].includes(rawResult)) result = 'LOSS';
  else if (['breakeven', 'be', 'scratch'].includes(rawResult)) result = 'BREAKEVEN';
  else if (pnl != null) {
    if (pnl > 0) result = 'WIN';
    else if (pnl < 0) result = 'LOSS';
    else result = 'BREAKEVEN';
  }

  // --- Notes ---
  const notes = get('notes', 'comment', 'comments', 'description', 'remarks');

  // --- Fields not present in broker exports — fill with defaults ---
  const dailyBias = direction === 'LONG' ? 'BULLISH' : 'BEARISH';

  return {
    accountId: fallbackAccountId,
    dateTime,
    market,
    session: 'NY',
    direction,
    dailyBias,
    ifvgTimeframe: null,
    setupGrade: 'B',
    confirmation1: null,
    confirmation2: null,
    entryPrice: safeEntryPrice,
    slPrice,
    slType: 'SAFE',
    tpPrice: tpPrice ?? null,
    contracts,
    rrTarget: null,
    exitPrice: exitPrice ?? null,
    result: result ?? null,
    rrAchieved: rrAchieved ?? null,
    pnl: pnl ?? null,
    ruleViolation: false,
    violationDescription: null,
    wentWell: null,
    toImprove: null,
    notes: notes || 'Imported from CSV',
    psychologyScore: null,
    killzoneConfirmed: false,
  };
}

async function importCsv(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { accountId } = req.body;
    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: req.user.id },
    });
    if (!account) {
      return res.status(400).json({ error: 'Invalid account' });
    }

    const text = req.file.buffer.toString('utf-8');
    const { records } = parseCsvToRecords(text);

    if (records.length === 0) {
      return res.status(400).json({ error: 'No rows found in CSV file' });
    }

    let remaining = Infinity;
    if (req.user.tier === 'FREE') {
      const now = new Date();
      const count = await prisma.trade.count({
        where: {
          userId: req.user.id,
          createdAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
        },
      });
      remaining = Math.max(0, FREE_TIER_MONTHLY_LIMIT - count);
    }

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      if (imported >= remaining) {
        skipped += records.length - i;
        errors.push(`Row ${i + 2}: skipped — FREE tier monthly limit (${FREE_TIER_MONTHLY_LIMIT}) reached`);
        break;
      }

      try {
        const data = mapCsvRecordToTrade(records[i], accountId);
        await prisma.trade.create({
          data: { ...data, userId: req.user.id },
        });
        imported++;
      } catch (err) {
        skipped++;
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    return res.status(201).json({ imported, skipped, total: records.length, errors });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTrades,
  createTrade,
  getTrade,
  updateTrade,
  deleteTrade,
  uploadScreenshot,
  exportCsv,
  importCsv,
  analyzeScreenshot,
  rateTrade,
};
