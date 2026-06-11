const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const {
  register,
  login,
  googleCallback,
  logout,
  me,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePreferences,
  changePassword,
  deleteAccount,
} = require('../controllers/authController');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  register
);

// POST /api/auth/login
router.post(
  '/login',
  passport.authenticate('local', { failWithError: true }),
  login,
  (err, req, res, next) => {
    return res.status(401).json({ error: err.message || 'Invalid credentials' });
  }
);

// GET /api/auth/google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth` }),
  googleCallback
);

// POST /api/auth/logout
router.post('/logout', requireAuth, logout);

// GET /api/auth/me
router.get('/me', requireAuth, me);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// PUT /api/auth/profile
router.put('/profile', requireAuth, updateProfile);

// PUT /api/auth/preferences
router.put('/preferences', requireAuth, updatePreferences);

// PUT /api/auth/change-password
router.put('/change-password', requireAuth, changePassword);

// DELETE /api/auth/account
router.delete('/account', requireAuth, deleteAccount);

module.exports = router;
