const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const {
  listAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
} = require('../controllers/accountsController');

// All account routes require authentication
router.use(requireAuth);

// GET /api/accounts
router.get('/', listAccounts);

// POST /api/accounts
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Account name is required'),
    body('accountType').optional().isIn(['LIVE', 'BACKTEST']).withMessage('Invalid account type'),
    body('accountSize')
      .if(body('accountType').not().equals('BACKTEST'))
      .isFloat({ gt: 0 })
      .withMessage('accountSize must be a positive number'),
    body('startingBalance')
      .if(body('accountType').not().equals('BACKTEST'))
      .isFloat({ gt: 0 })
      .withMessage('startingBalance must be a positive number'),
  ],
  createAccount
);

// GET /api/accounts/:id
router.get('/:id', getAccount);

// PUT /api/accounts/:id
router.put('/:id', updateAccount);
router.patch('/:id', updateAccount);

// DELETE /api/accounts/:id
router.delete('/:id', deleteAccount);

module.exports = router;
