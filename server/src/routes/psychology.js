const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  getBaseline,
  submitBaseline,
  listCheckins,
  createCheckin,
  getTodayCheckin,
  listReflections,
  createReflection,
} = require('../controllers/psychologyController');

router.use(requireAuth);

// GET  /api/psychology/baseline
router.get('/baseline', getBaseline);

// POST /api/psychology/baseline
router.post('/baseline', submitBaseline);

// GET  /api/psychology/checkins/today  — before /checkins to avoid :id collision
router.get('/checkins/today', getTodayCheckin);

// GET  /api/psychology/checkins
router.get('/checkins', listCheckins);

// POST /api/psychology/checkins
router.post('/checkins', createCheckin);

// GET  /api/psychology/reflections
router.get('/reflections', listReflections);

// POST /api/psychology/reflections
router.post('/reflections', createReflection);

module.exports = router;
