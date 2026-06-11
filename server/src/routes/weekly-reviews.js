const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  listReviews,
  createReview,
  getReview,
  updateReview,
  getCurrentWeekData,
} = require('../controllers/weeklyReviewsController');

router.use(requireAuth);

// GET  /api/weekly-reviews/current  — before /:id
router.get('/current', getCurrentWeekData);

// GET  /api/weekly-reviews
router.get('/', listReviews);

// POST /api/weekly-reviews
router.post('/', createReview);

// GET  /api/weekly-reviews/:id
router.get('/:id', getReview);

// PUT  /api/weekly-reviews/:id
router.put('/:id', updateReview);

module.exports = router;
