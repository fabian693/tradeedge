const prisma = require('../db');
const { subDays, startOfDay } = require('date-fns');

const TRADE_FIELDS = {
  id: true,
  dateTime: true,
  market: true,
  session: true,
  direction: true,
  setupGrade: true,
  entryPrice: true,
  exitPrice: true,
  tpPrice: true,
  slPrice: true,
  rrAchieved: true,
  result: true,
  pnl: true,
  notes: true,
  wentWell: true,
};

// GET /api/public/trades — free, no-auth: last 7 days of public trades
async function listPublicTrades(req, res, next) {
  try {
    const trader = await prisma.user.findFirst({
      where: { isPublicTrader: true },
      select: { id: true, name: true },
    });

    if (!trader) {
      return res.json({ trader: null, trades: [], delayed: true });
    }

    const since = startOfDay(subDays(new Date(), 7));

    const trades = await prisma.trade.findMany({
      where: {
        userId: trader.id,
        isPublic: true,
        dateTime: { gte: since },
      },
      orderBy: { dateTime: 'desc' },
      select: TRADE_FIELDS,
    });

    return res.json({
      trader: { name: trader.name },
      trades,
      delayed: true,
      range: 'last_7_days',
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/public/trades/live — PRO/auth required: today's trades, real-time
async function listLiveTrades(req, res, next) {
  try {
    const trader = await prisma.user.findFirst({
      where: { isPublicTrader: true },
      select: { id: true, name: true },
    });

    if (!trader) {
      return res.json({ trader: null, trades: [], delayed: false });
    }

    const since = startOfDay(new Date());

    const trades = await prisma.trade.findMany({
      where: {
        userId: trader.id,
        isPublic: true,
        dateTime: { gte: since },
      },
      orderBy: { dateTime: 'desc' },
      select: TRADE_FIELDS,
    });

    return res.json({
      trader: { name: trader.name },
      trades,
      delayed: false,
      range: 'today',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPublicTrades, listLiveTrades };
