const prisma = require('../db');
const { startOfWeek, endOfWeek } = require('date-fns');

function getWeekStart(date) {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

async function _computeWeekStats(userId, weekStart, accountId) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const where = {
    userId,
    dateTime: { gte: weekStart, lte: weekEnd },
    result: { not: null },
  };
  if (accountId) where.accountId = accountId;

  const trades = await prisma.trade.findMany({ where });

  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result === 'WIN').length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  const pnls = trades.map((t) => t.pnl || 0);
  const totalPnl = pnls.reduce((a, b) => a + b, 0);

  const rrVals = trades.filter((t) => t.rrAchieved != null).map((t) => t.rrAchieved);
  const avgRr = rrVals.length > 0 ? rrVals.reduce((a, b) => a + b, 0) / rrVals.length : 0;

  const psychScores = trades.filter((t) => t.psychologyScore != null).map((t) => t.psychologyScore);
  const avgPsychologyScore =
    psychScores.length > 0 ? psychScores.reduce((a, b) => a + b, 0) / psychScores.length : 0;

  const ruleViolations = trades.filter((t) => t.ruleViolation).length;

  // Best trade = highest rrAchieved
  const bestTrade = rrVals.length > 0
    ? trades.filter((t) => t.rrAchieved != null).reduce((best, t) => (t.rrAchieved > best.rrAchieved ? t : best))
    : null;

  return {
    totalTrades,
    winRate,
    avgRr: Math.round(avgRr * 100) / 100,
    totalPnl: Math.round(totalPnl * 100) / 100,
    avgPsychologyScore: Math.round(avgPsychologyScore * 10) / 10,
    ruleViolations,
    bestTradeId: bestTrade?.id || null,
    bestTrade: bestTrade ? {
      id: bestTrade.id,
      market: bestTrade.market,
      session: bestTrade.session,
      direction: bestTrade.direction,
      rrAchieved: bestTrade.rrAchieved,
    } : null,
  };
}

async function listReviews(req, res, next) {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [total, reviews] = await Promise.all([
      prisma.weeklyReview.count({ where: { userId: req.user.id } }),
      prisma.weeklyReview.findMany({
        where: { userId: req.user.id },
        orderBy: { weekStartDate: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return res.json({
      reviews,
      pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
}

async function createReview(req, res, next) {
  try {
    const {
      weekStartDate,
      accountId,
      worstDecision,
      whatWorked,
      whatToImprove,
      followedRoutine,
      disciplineGrade,
      nextWeekGoal,
      weekGrade,
    } = req.body;

    const weekStart = weekStartDate ? getWeekStart(new Date(weekStartDate)) : getWeekStart(new Date());
    weekStart.setHours(0, 0, 0, 0);

    // Check for existing review
    const existing = await prisma.weeklyReview.findUnique({
      where: { userId_weekStartDate: { userId: req.user.id, weekStartDate: weekStart } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Review for this week already exists. Use PUT to update.' });
    }

    const stats = await _computeWeekStats(req.user.id, weekStart, accountId);

    const review = await prisma.weeklyReview.create({
      data: {
        userId: req.user.id,
        weekStartDate: weekStart,
        ...stats,
        worstDecision,
        whatWorked,
        whatToImprove,
        followedRoutine,
        disciplineGrade,
        nextWeekGoal,
        weekGrade,
      },
    });

    return res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

async function getReview(req, res, next) {
  try {
    const review = await prisma.weeklyReview.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { bestTrade: { select: { id: true, market: true, result: true, rrAchieved: true, dateTime: true } } },
    });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    return res.json({ review });
  } catch (err) {
    next(err);
  }
}

async function updateReview(req, res, next) {
  try {
    const existing = await prisma.weeklyReview.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const allowed = [
      'worstDecision',
      'whatWorked',
      'whatToImprove',
      'followedRoutine',
      'disciplineGrade',
      'nextWeekGoal',
      'weekGrade',
      'bestTradeId',
    ];

    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    const review = await prisma.weeklyReview.update({
      where: { id: req.params.id },
      data,
    });

    return res.json({ review });
  } catch (err) {
    next(err);
  }
}

async function getCurrentWeekData(req, res, next) {
  try {
    const { accountId } = req.query;
    const weekStart = getWeekStart(new Date());
    weekStart.setHours(0, 0, 0, 0);

    const stats = await _computeWeekStats(req.user.id, weekStart, accountId);

    // Check if review already exists
    const existingReview = await prisma.weeklyReview.findUnique({
      where: { userId_weekStartDate: { userId: req.user.id, weekStartDate: weekStart } },
    });

    return res.json({ weekStart, stats, existingReview });
  } catch (err) {
    next(err);
  }
}

module.exports = { listReviews, createReview, getReview, updateReview, getCurrentWeekData };
