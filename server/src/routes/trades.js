const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const {
  listTrades,
  createTrade,
  getTrade,
  updateTrade,
  deleteTrade,
  uploadScreenshot,
  exportCsv,
  importCsv,
  analyzeScreenshot,
  rateTrade,
} = require('../controllers/tradesController');

// Multer: store in memory for Cloudinary streaming
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Multer: CSV/text uploads for trade import
const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const okMime = ['text/csv', 'application/vnd.ms-excel', 'text/plain', 'application/csv', 'application/octet-stream'];
    if (okMime.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// All trade routes require authentication
router.use(requireAuth);

// GET /api/trades/export/csv  — must be before /:id
router.get('/export/csv', exportCsv);

// POST /api/trades/analyze-screenshot — must be before /:id
router.post('/analyze-screenshot', upload.single('screenshot'), analyzeScreenshot);

// POST /api/trades/import-csv — must be before /:id
router.post('/import-csv', uploadCsv.single('file'), importCsv);

// GET /api/trades
router.get('/', listTrades);

// POST /api/trades
router.post(
  '/',
  [
    body('accountId').notEmpty().withMessage('accountId is required'),
    body('dateTime').isISO8601().withMessage('dateTime must be a valid ISO date'),
    body('market').isIn(['NQ', 'ES']).withMessage('market must be NQ or ES'),
    body('session').isIn(['LONDON', 'NY']).withMessage('session must be LONDON or NY'),
    body('direction').isIn(['LONG', 'SHORT']).withMessage('direction must be LONG or SHORT'),
    body('dailyBias').isIn(['BULLISH', 'BEARISH']).withMessage('dailyBias must be BULLISH or BEARISH'),
    body('setupGrade').isIn(['A_PLUS', 'A', 'B']).withMessage('setupGrade must be A_PLUS, A, or B'),
    body('entryPrice').isFloat().withMessage('entryPrice must be a number'),
    body('slPrice').isFloat().withMessage('slPrice must be a number'),
  ],
  createTrade
);

// GET /api/trades/:id
router.get('/:id', getTrade);

// PUT /api/trades/:id
router.put('/:id', updateTrade);

// DELETE /api/trades/:id
router.delete('/:id', deleteTrade);

// POST /api/trades/:id/screenshot
router.post('/:id/screenshot', upload.single('screenshot'), uploadScreenshot);

// POST /api/trades/:id/rate
router.post('/:id/rate', rateTrade);

module.exports = router;
