const prisma = require('../db');
const { validationResult } = require('express-validator');

async function listAccounts(req, res, next) {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ accounts });
  } catch (err) {
    next(err);
  }
}

async function createAccount(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      accountType,
      propFirmName,
      accountSize,
      startingBalance,
      currentBalance,
      profitTarget,
      drawdownType,
      drawdownValue,
      dailyLossLimit,
      consistencyRule,
      maxContracts,
      payoutFrequency,
      notes,
    } = req.body;

    const isBacktest = accountType === 'BACKTEST';

    const account = await prisma.account.create({
      data: {
        userId: req.user.id,
        name,
        accountType: isBacktest ? 'BACKTEST' : 'LIVE',
        propFirmName: isBacktest ? undefined : propFirmName,
        accountSize: accountSize != null ? Number(accountSize) : 0,
        startingBalance: startingBalance != null ? Number(startingBalance) : 0,
        currentBalance: currentBalance != null ? Number(currentBalance) : Number(startingBalance ?? 0),
        profitTarget: !isBacktest && profitTarget != null ? Number(profitTarget) : undefined,
        drawdownType: isBacktest ? undefined : drawdownType,
        drawdownValue: !isBacktest && drawdownValue != null ? Number(drawdownValue) : undefined,
        dailyLossLimit: !isBacktest && dailyLossLimit != null ? Number(dailyLossLimit) : undefined,
        consistencyRule: !isBacktest && consistencyRule != null ? Number(consistencyRule) : undefined,
        maxContracts: !isBacktest && maxContracts != null ? Number(maxContracts) : undefined,
        payoutFrequency: isBacktest ? undefined : payoutFrequency,
        notes,
      },
    });

    return res.status(201).json({ account });
  } catch (err) {
    next(err);
  }
}

async function getAccount(req, res, next) {
  try {
    const account = await prisma.account.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Compute stats from trades
    const trades = await prisma.trade.findMany({
      where: { accountId: account.id, result: { not: null } },
    });

    const totalTrades = trades.length;
    const wins = trades.filter((t) => t.result === 'WIN').length;
    const losses = trades.filter((t) => t.result === 'LOSS').length;
    const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const rrValues = trades.filter((t) => t.rrAchieved != null).map((t) => t.rrAchieved);
    const avgRr = rrValues.length > 0 ? rrValues.reduce((a, b) => a + b, 0) / rrValues.length : 0;

    // Win streak
    let currentStreak = 0;
    let maxStreak = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].result === 'WIN') {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        break;
      }
    }

    return res.json({
      account,
      stats: {
        totalTrades,
        wins,
        losses,
        winRate,
        totalPnl: Math.round(totalPnl * 100) / 100,
        avgRr: Math.round(avgRr * 100) / 100,
        currentStreak,
        maxStreak,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateAccount(req, res, next) {
  try {
    const existing = await prisma.account.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const {
      name,
      accountType,
      propFirmName,
      accountSize,
      startingBalance,
      currentBalance,
      profitTarget,
      drawdownType,
      drawdownValue,
      dailyLossLimit,
      consistencyRule,
      maxContracts,
      payoutFrequency,
      notes,
    } = req.body;

    const account = await prisma.account.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(accountType !== undefined && { accountType }),
        ...(propFirmName !== undefined && { propFirmName }),
        ...(accountSize !== undefined && { accountSize: Number(accountSize) }),
        ...(startingBalance !== undefined && { startingBalance: Number(startingBalance) }),
        ...(currentBalance !== undefined && { currentBalance: Number(currentBalance) }),
        ...(profitTarget !== undefined && { profitTarget: Number(profitTarget) }),
        ...(drawdownType !== undefined && { drawdownType }),
        ...(drawdownValue !== undefined && { drawdownValue: Number(drawdownValue) }),
        ...(dailyLossLimit !== undefined && { dailyLossLimit: Number(dailyLossLimit) }),
        ...(consistencyRule !== undefined && { consistencyRule: Number(consistencyRule) }),
        ...(maxContracts !== undefined && { maxContracts: Number(maxContracts) }),
        ...(payoutFrequency !== undefined && { payoutFrequency }),
        ...(notes !== undefined && { notes }),
      },
    });

    return res.json({ account });
  } catch (err) {
    next(err);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const existing = await prisma.account.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await prisma.account.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAccounts, createAccount, getAccount, updateAccount, deleteAccount };
