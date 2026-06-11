const express = require('express');
const router = express.Router();
const { requireAuth, requirePro } = require('../middleware/auth');
const { listPublicTrades, listLiveTrades } = require('../controllers/publicController');

// GET /api/public/trades — no auth required, last week's trades (delayed)
router.get('/trades', listPublicTrades);

// GET /api/public/trades/live — PRO subscribers only, today's trades in real-time
router.get('/trades/live', requireAuth, requirePro, listLiveTrades);

module.exports = router;
