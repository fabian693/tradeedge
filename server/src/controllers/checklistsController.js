const prisma = require('../db');
const { computeVerdict } = require('../utils/checklist');

async function listChecklists(req, res, next) {
  try {
    const { page = '1', limit = '20', session } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const where = { userId: req.user.id };
    if (session) where.session = session;

    const [total, checklists] = await Promise.all([
      prisma.checklist.count({ where }),
      prisma.checklist.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return res.json({
      checklists,
      pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
}

async function upsertChecklist(req, res, next) {
  try {
    const { date, session, ...fields } = req.body;

    if (!session) {
      return res.status(400).json({ error: 'session is required' });
    }

    const checklistDate = date ? new Date(date) : new Date();
    checklistDate.setHours(0, 0, 0, 0);

    // Build boolean fields
    const booleanFields = [
      'dailyBiasSet',
      'sessionHighsLowsMarked',
      'premiumDiscountSet',
      'prepCompleted',
      'htLtReviewed',
      'calendarChecked',
      'killzoneSelected',
      'ifvgIdentified',
      'cleanCloseConfirmed',
      'confirmation1',
      'confirmation2',
      'bothAlign',
      'rrConfirmed',
      'consistencyChecked',
      'dailyTargetChecked',
      'slDecided',
      'tpSet',
      'contractsChecked',
    ];

    const data = { session };
    for (const key of booleanFields) {
      if (fields[key] !== undefined) {
        data[key] = fields[key] === true || fields[key] === 'true';
      }
    }

    // Compute verdict using merged values
    const merged = {};
    for (const key of booleanFields) {
      merged[key] = data[key] !== undefined ? data[key] : false;
    }
    data.verdict = computeVerdict(merged);

    const checklist = await prisma.checklist.upsert({
      where: {
        userId_date_session: {
          userId: req.user.id,
          date: checklistDate,
          session,
        },
      },
      update: data,
      create: {
        userId: req.user.id,
        date: checklistDate,
        ...data,
      },
    });

    return res.status(201).json({ checklist });
  } catch (err) {
    next(err);
  }
}

async function getTodayChecklist(req, res, next) {
  try {
    const { session } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = { userId: req.user.id, date: today };
    if (session) where.session = session;

    const checklists = await prisma.checklist.findMany({ where });
    return res.json({ checklists });
  } catch (err) {
    next(err);
  }
}

module.exports = { listChecklists, upsertChecklist, getTodayChecklist };
