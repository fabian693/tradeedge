const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  listChecklists,
  upsertChecklist,
  getTodayChecklist,
} = require('../controllers/checklistsController');

router.use(requireAuth);

// GET  /api/checklists/today  — before / to avoid ambiguity
router.get('/today', getTodayChecklist);

// GET  /api/checklists
router.get('/', listChecklists);

// POST /api/checklists
router.post('/', upsertChecklist);

module.exports = router;
