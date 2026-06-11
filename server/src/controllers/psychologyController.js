const prisma = require('../db');
const { computeBaselineProfile, computeCheckinRecommendation } = require('../utils/psychology');

// ── Baseline ──────────────────────────────────────────────────────────────────

async function getBaseline(req, res, next) {
  try {
    const baseline = await prisma.psychologyBaseline.findUnique({
      where: { userId: req.user.id },
    });
    return res.json({ baseline });
  } catch (err) {
    next(err);
  }
}

async function submitBaseline(req, res, next) {
  try {
    const { scores } = req.body;

    if (!Array.isArray(scores) || scores.length !== 20) {
      return res.status(400).json({ error: 'scores must be an array of exactly 20 numbers (1-10)' });
    }

    const { overallScore, profileType } = computeBaselineProfile(scores);

    const baseline = await prisma.psychologyBaseline.upsert({
      where: { userId: req.user.id },
      update: {
        scores,
        profileType,
        overallScore,
        completedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        scores,
        profileType,
        overallScore,
      },
    });

    return res.status(201).json({ baseline });
  } catch (err) {
    if (err.message.includes('scores must be')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

// ── Check-ins ─────────────────────────────────────────────────────────────────

async function listCheckins(req, res, next) {
  try {
    const { dateFrom, dateTo, page = '1', limit = '30' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const where = { userId: req.user.id };
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [total, checkins] = await Promise.all([
      prisma.psychologyCheckin.count({ where }),
      prisma.psychologyCheckin.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return res.json({
      checkins,
      pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
}

async function createCheckin(req, res, next) {
  try {
    const { date, sleepQuality, stressLevel, confidence, financialPressure, focus, emotionalStability, readiness } =
      req.body;

    const requiredFields = { sleepQuality, stressLevel, confidence, financialPressure, focus, emotionalStability, readiness };
    for (const [key, val] of Object.entries(requiredFields)) {
      const n = Number(val);
      if (isNaN(n) || n < 1 || n > 10) {
        return res.status(400).json({ error: `${key} must be a number between 1 and 10` });
      }
    }

    const checkinDate = date ? new Date(date) : new Date();
    // Normalize to date-only
    checkinDate.setHours(0, 0, 0, 0);

    const scores = {
      sleepQuality: Number(sleepQuality),
      stressLevel: Number(stressLevel),
      confidence: Number(confidence),
      financialPressure: Number(financialPressure),
      focus: Number(focus),
      emotionalStability: Number(emotionalStability),
      readiness: Number(readiness),
    };

    const { recommendation, overallScore } = computeCheckinRecommendation(scores);

    const checkin = await prisma.psychologyCheckin.upsert({
      where: { userId_date: { userId: req.user.id, date: checkinDate } },
      update: { ...scores, overallScore, recommendation },
      create: { userId: req.user.id, date: checkinDate, ...scores, overallScore, recommendation },
    });

    return res.status(201).json({ checkin });
  } catch (err) {
    next(err);
  }
}

async function getTodayCheckin(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkin = await prisma.psychologyCheckin.findUnique({
      where: { userId_date: { userId: req.user.id, date: today } },
    });

    return res.json({ checkin });
  } catch (err) {
    next(err);
  }
}

// ── Reflections ───────────────────────────────────────────────────────────────

async function listReflections(req, res, next) {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const where = { userId: req.user.id };

    const [total, reflections] = await Promise.all([
      prisma.psychologyReflection.count({ where }),
      prisma.psychologyReflection.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: { trade: { select: { id: true, market: true, result: true, dateTime: true } } },
      }),
    ]);

    return res.json({
      reflections,
      pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
}

async function createReflection(req, res, next) {
  try {
    const {
      tradeId,
      date,
      followedRules,
      feltEmotional,
      revengeTrade,
      overtraded,
      disciplineGrade,
      wentWell,
      toImprove,
    } = req.body;

    if (!followedRules || !disciplineGrade) {
      return res.status(400).json({ error: 'followedRules and disciplineGrade are required' });
    }

    // If tradeId provided, verify it belongs to the user
    if (tradeId) {
      const trade = await prisma.trade.findFirst({ where: { id: tradeId, userId: req.user.id } });
      if (!trade) {
        return res.status(400).json({ error: 'Invalid tradeId' });
      }
    }

    const reflectionDate = date ? new Date(date) : new Date();
    reflectionDate.setHours(0, 0, 0, 0);

    const reflection = await prisma.psychologyReflection.create({
      data: {
        userId: req.user.id,
        tradeId: tradeId || undefined,
        date: reflectionDate,
        followedRules,
        feltEmotional: feltEmotional === true || feltEmotional === 'true',
        revengeTrade: revengeTrade === true || revengeTrade === 'true',
        overtraded: overtraded === true || overtraded === 'true',
        disciplineGrade,
        wentWell,
        toImprove,
      },
    });

    return res.status(201).json({ reflection });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBaseline,
  submitBaseline,
  listCheckins,
  createCheckin,
  getTodayCheckin,
  listReflections,
  createReflection,
};
