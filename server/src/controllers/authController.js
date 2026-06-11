const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const prisma = require('../db');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// In-memory token store for password resets (swap for DB in production)
const resetTokens = new Map();

async function register(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
      },
    });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(201).json({ user: _safeUser(user) });
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res) {
  return res.json({ user: _safeUser(req.user) });
}

function googleAuth(req, res, next) {
  // Handled by passport middleware in route
  next();
}

async function googleCallback(req, res) {
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`);
}

async function logout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logged out' });
    });
  });
}

async function me(req, res) {
  return res.json({ user: _safeUser(req.user) });
}

async function forgotPassword(req, res, next) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always respond with success to avoid email enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const token = uuidv4();
    const expires = Date.now() + 1000 * 60 * 60; // 1 hour
    resetTokens.set(token, { userId: user.id, expires });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'TradeEdge: Password Reset',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
      });
    } catch (mailErr) {
      console.error('Failed to send reset email:', mailErr.message);
    }

    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const record = resetTokens.get(token);
    if (!record || record.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });

    resetTokens.delete(token);
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  const { name, email, experienceLevel, propFirm, accountSize, preferredSession, timezone } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(experienceLevel && { experienceLevel }),
        ...(propFirm !== undefined && { propFirm }),
        ...(accountSize !== undefined && { accountSize: parseFloat(accountSize) || null }),
        ...(preferredSession && { preferredSession }),
        ...(timezone && { timezone }),
      },
    });
    return res.json({ user: _safeUser(updated) });
  } catch (err) {
    next(err);
  }
}

async function updatePreferences(req, res, next) {
  // Store preferences in user record if schema supports it, else just acknowledge
  return res.json({ message: 'Preferences saved' });
}

async function changePassword(req, res, next) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.passwordHash) {
      return res.status(400).json({ error: 'Google accounts cannot use password change' });
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    return res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
}

async function deleteAccount(req, res, next) {
  try {
    // Cascade deletes handle related records via Prisma schema
    await prisma.user.delete({ where: { id: req.user.id } });
    req.logout((err) => {
      if (err) console.error(err);
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        return res.json({ message: 'Account deleted' });
      });
    });
  } catch (err) {
    next(err);
  }
}

function _safeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = {
  register,
  login,
  googleAuth,
  googleCallback,
  logout,
  me,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePreferences,
  changePassword,
  deleteAccount,
};
