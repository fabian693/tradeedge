const prisma = require('../db');
const { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, format } = require('date-fns');

async function overview(req, res, next) {
  try {
    const { accountId } = req.query;
    const where = { userId: req.user.id };
    if (accountId) where.accountId = accountId;

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { dateTime: 'asc' },
    });

    const completedTrades = trades.filter((t) => t.result != null);
    const wins = completedTrades.filter((t) => t.result === 'WIN');
    const losses = completedTrades.filter((t) => t.result === 'LOSS');

    const totalTrades = completedTrades.length;
    const winRate = totalTrades > 0 ? Math.round((wins.length / totalTrades) * 100) : 0;
    const totalPnl = completedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    const rrValues = completedTrades.filter((t) => t.rrAchieved != null).map((t) => t.rrAchieved);
    const avgRr = rrValues.length > 0 ? rrValues.reduce((a, b) => a + b, 0) / rrValues.length : 0;
    const bestRr = rrValues.length > 0 ? Math.max(...rrValues) : 0;

    // Current win streak
    let streak = 0;
    for (let i = completedTrades.length - 1; i >= 0; i--) {
      if (completedTrades[i].result === 'WIN') streak++;
      else break;
    }

    const ruleViolations = trades.filter((t) => t.ruleViolation).length;
    const psychScores = trades.filter((t) => t.psychologyScore != null).map((t) => t.psychologyScore);
    const avgPsychScore =
      psychScores.length > 0 ? psychScores.reduce((a, b) => a + b, 0) / psychScores.length : null;

    return res.json({
      totalTrades,
      wins: wins.length,
      losses: losses.length,
      winRate,
      totalPnl: Math.round(totalPnl * 100) / 100,
      avgRr: Math.round(avgRr * 100) / 100,
      bestRr: Math.round(bestRr * 100) / 100,
      currentStreak: streak,
      ruleViolations,
      avgPsychologyScore: avgPsychScore != null ? Math.round(avgPsychScore * 10) / 10 : null,
    });
  } catch (err) {
    next(err);
  }
}

async function equityCurve(req, res, next) {
  try {
    const { accountId } = req.query;
    const where = { userId: req.user.id, pnl: { not: null } };
    if (accountId) where.accountId = accountId;

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { dateTime: 'asc' },
      select: { id: true, dateTime: true, pnl: true },
    });

    let running = 0;
    const points = trades.map((t) => {
      running += t.pnl;
      return { date: t.dateTime, pnl: t.pnl, equity: Math.round(running * 100) / 100 };
    });

    return res.json({ points });
  } catch (err) {
    next(err);
  }
}

async function bySession(req, res, next) {
  try {
    const { accountId } = req.query;
    const where = { userId: req.user.id, result: { not: null } };
    if (accountId) where.accountId = accountId;

    const trades = await prisma.trade.findMany({ where, select: { session: true, result: true, pnl: true, rrAchieved: true } });

    const grouped = {};
    for (const t of trades) {
      if (!grouped[t.session]) grouped[t.session] = { session: t.session, trades: 0, wins: 0, totalPnl: 0, rrValues: [] };
      grouped[t.session].trades++;
      if (t.result === 'WIN') grouped[t.session].wins++;
      grouped[t.session].totalPnl += t.pnl || 0;
      if (t.rrAchieved != null) grouped[t.session].rrValues.push(t.rrAchieved);
    }

    const data = Object.values(grouped).map((g) => ({
      session: g.session,
      trades: g.trades,
      wins: g.wins,
      winRate: g.trades > 0 ? Math.round((g.wins / g.trades) * 100) : 0,
      totalPnl: Math.round(g.totalPnl * 100) / 100,
      avgRr: g.rrValues.length > 0 ? Math.round((g.rrValues.reduce((a, b) => a + b, 0) / g.rrValues.length) * 100) / 100 : 0,
    }));

    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function byConfirmation(req, res, next) {
  try {
    const { accountId } = req.query;
    const where = { userId: req.user.id, result: { not: null } };
    if (accountId) where.accountId = accountId;

    const trades = await prisma.trade.findMany({
      where,
      select: { confirmation1: true, confirmation2: true, result: true, pnl: true },
    });

    const grouped = {};
    for (const t of trades) {
      const key = [t.confirmation1, t.confirmation2].filter(Boolean).sort().join(' + ') || 'None';
      if (!grouped[key]) grouped[key] = { combo: key, trades: 0, wins: 0, totalPnl: 0 };
      grouped[key].trades++;
      if (t.result === 'WIN') grouped[key].wins++;
      grouped[key].totalPnl += t.pnl || 0;
    }

    const data = Object.values(grouped).map((g) => ({
      combo: g.combo,
      trades: g.trades,
      wins: g.wins,
      winRate: g.trades > 0 ? Math.round((g.wins / g.trades) * 100) : 0,
      totalPnl: Math.round(g.totalPnl * 100) / 100,
    }));

    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function byMarket(req, res, next) {
  try {
    const { accountId } = req.query;
    const where = { userId: req.user.id, result: { not: null } };
    if (accountId) where.accountId = accountId;

    const trades = await prisma.trade.findMany({
      where,
      select: { market: true, result: true, pnl: true, rrAchieved: true },
    });

    const grouped = {};
    for (const t of trades) {
      if (!grouped[t.market]) grouped[t.market] = { market: t.market, trades: 0, wins: 0, totalPnl: 0, rrValues: [] };
      grouped[t.market].trades++;
      if (t.result === 'WIN') grouped[t.market].wins++;
      grouped[t.market].totalPnl += t.pnl || 0;
      if (t.rrAchieved != null) grouped[t.market].rrValues.push(t.rrAchieved);
    }

    const data = Object.values(grouped).map((g) => ({
      market: g.market,
      trades: g.trades,
      wins: g.wins,
      winRate: g.trades > 0 ? Math.round((g.wins / g.trades) * 100) : 0,
      totalPnl: Math.round(g.totalPnl * 100) / 100,
      avgRr: g.rrValues.length > 0 ? Math.round((g.rrValues.reduce((a, b) => a + b, 0) / g.rrValues.length) * 100) / 100 : 0,
    }));

    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function byGrade(req, res, next) {
  try {
    const { accountId } = req.query;
    const where = { userId: req.user.id, result: { not: null } };
    if (accountId) where.accountId = accountId;

    const trades = await prisma.trade.findMany({
      where,
      select: { setupGrade: true, result: true, pnl: true, rrAchieved: true },
    });

    const grouped = {};
    for (const t of trades) {
      if (!grouped[t.setupGrade]) grouped[t.setupGrade] = { grade: t.setupGrade, trades: 0, wins: 0, totalPnl: 0, rrValues: [] };
      grouped[t.setupGrade].trades++;
      if (t.result === 'WIN') grouped[t.setupGrade].wins++;
      grouped[t.setupGrade].totalPnl += t.pnl || 0;
      if (t.rrAchieved != null) grouped[t.setupGrade].rrValues.push(t.rrAchieved);
    }

    const data = Object.values(grouped).map((g) => ({
      grade: g.grade,
      trades: g.trades,
      wins: g.wins,
      winRate: g.trades > 0 ? Math.round((g.wins / g.trades) * 100) : 0,
      totalPnl: Math.round(g.totalPnl * 100) / 100,
      avgRr: g.rrValues.length > 0 ? Math.round((g.rrValues.reduce((a, b) => a + b, 0) / g.rrValues.length) * 100) / 100 : 0,
    }));

    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function psychologyCorrelation(req, res, next) {
  try {
    const { accountId } = req.query;
    const where = { userId: req.user.id, psychologyScore: { not: null }, result: { not: null } };
    if (accountId) where.accountId = accountId;

    const trades = await prisma.trade.findMany({
      where,
      select: { id: true, psychologyScore: true, rrAchieved: true, result: true, pnl: true, dateTime: true },
    });

    const points = trades.map((t) => ({
      id: t.id,
      date: t.dateTime,
      psychologyScore: t.psychologyScore,
      rrAchieved: t.rrAchieved,
      result: t.result,
      pnl: t.pnl,
    }));

    return res.json({ points });
  } catch (err) {
    next(err);
  }
}

async function weeklyComparison(req, res, next) {
  try {
    const { accountId } = req.query;
    const now = new Date();

    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const buildWhere = (start, end) => {
      const w = { userId: req.user.id, dateTime: { gte: start, lte: end }, result: { not: null } };
      if (accountId) w.accountId = accountId;
      return w;
    };

    const [thisWeekTrades, lastWeekTrades] = await Promise.all([
      prisma.trade.findMany({ where: buildWhere(thisWeekStart, thisWeekEnd) }),
      prisma.trade.findMany({ where: buildWhere(lastWeekStart, lastWeekEnd) }),
    ]);

    const summarize = (trades) => {
      const total = trades.length;
      const wins = trades.filter((t) => t.result === 'WIN').length;
      const pnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const rrVals = trades.filter((t) => t.rrAchieved != null).map((t) => t.rrAchieved);
      const avgRr = rrVals.length > 0 ? rrVals.reduce((a, b) => a + b, 0) / rrVals.length : 0;
      const violations = trades.filter((t) => t.ruleViolation).length;
      return {
        totalTrades: total,
        wins,
        winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
        totalPnl: Math.round(pnl * 100) / 100,
        avgRr: Math.round(avgRr * 100) / 100,
        ruleViolations: violations,
      };
    };

    return res.json({
      thisWeek: { ...summarize(thisWeekTrades), start: thisWeekStart, end: thisWeekEnd },
      lastWeek: { ...summarize(lastWeekTrades), start: lastWeekStart, end: lastWeekEnd },
    });
  } catch (err) {
    next(err);
  }
}

async function calendar(req, res, next) {
  try {
    const { accountId, month } = req.query;

    // month expected as 'YYYY-MM'; defaults to current month
    let monthDate;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split('-').map(Number);
      monthDate = new Date(year, mon - 1, 1);
    } else {
      monthDate = new Date();
    }

    const rangeStart = startOfMonth(monthDate);
    const rangeEnd = endOfMonth(monthDate);

    const where = {
      userId: req.user.id,
      dateTime: { gte: rangeStart, lte: rangeEnd },
    };
    if (accountId) where.accountId = accountId;

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { dateTime: 'asc' },
      select: { id: true, dateTime: true, pnl: true, result: true, rrAchieved: true },
    });

    const days = {};
    for (const t of trades) {
      const key = format(t.dateTime, 'yyyy-MM-dd');
      if (!days[key]) days[key] = { date: key, pnl: 0, rr: 0, trades: 0, wins: 0, losses: 0, breakevens: 0 };
      days[key].pnl += t.pnl || 0;
      days[key].rr += t.rrAchieved || 0;
      days[key].trades += 1;
      if (t.result === 'WIN') days[key].wins += 1;
      else if (t.result === 'LOSS') days[key].losses += 1;
      else if (t.result === 'BREAKEVEN') days[key].breakevens += 1;
    }

    const dayList = Object.values(days).map((d) => ({
      ...d,
      pnl: Math.round(d.pnl * 100) / 100,
      rr: Math.round(d.rr * 100) / 100,
    }));

    const totalPnl = dayList.reduce((sum, d) => sum + d.pnl, 0);
    const totalRr = dayList.reduce((sum, d) => sum + d.rr, 0);
    const totalTrades = dayList.reduce((sum, d) => sum + d.trades, 0);
    const totalWins = dayList.reduce((sum, d) => sum + d.wins, 0);
    const totalLosses = dayList.reduce((sum, d) => sum + d.losses, 0);

    return res.json({
      month: format(monthDate, 'yyyy-MM'),
      days: dayList,
      summary: {
        totalPnl: Math.round(totalPnl * 100) / 100,
        totalRr: Math.round(totalRr * 100) / 100,
        totalTrades,
        totalWins,
        totalLosses,
        tradingDays: dayList.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  overview,
  equityCurve,
  bySession,
  byConfirmation,
  byMarket,
  byGrade,
  psychologyCorrelation,
  weeklyComparison,
  calendar,
};
