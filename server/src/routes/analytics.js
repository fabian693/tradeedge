const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  overview,
  equityCurve,
  bySession,
  byConfirmation,
  byMarket,
  byGrade,
  psychologyCorrelation,
  weeklyComparison,
  calendar,
} = require('../controllers/analyticsController');

router.use(requireAuth);

// GET /api/analytics/overview
router.get('/overview', overview);

// GET /api/analytics/equity
router.get('/equity', equityCurve);

// GET /api/analytics/by-session
router.get('/by-session', bySession);

// GET /api/analytics/by-confirmation
router.get('/by-confirmation', byConfirmation);

// GET /api/analytics/by-market
router.get('/by-market', byMarket);

// GET /api/analytics/by-grade
router.get('/by-grade', byGrade);

// GET /api/analytics/psychology-correlation
router.get('/psychology-correlation', psychologyCorrelation);

// GET /api/analytics/weekly-comparison
router.get('/weekly-comparison', weeklyComparison);

// GET /api/analytics/calendar
router.get('/calendar', calendar);

module.exports = router;
