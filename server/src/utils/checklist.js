/**
 * MUST items: these must all be true for any non-DO_NOT_TRADE verdict.
 */
const MUST_ITEMS = [
  'dailyBiasSet',
  'killzoneSelected',
  'ifvgIdentified',
  'cleanCloseConfirmed',
  'confirmation1',
  'rrConfirmed',
  'slDecided',
];

/**
 * All checklist boolean fields used to compute overall percentage.
 */
const ALL_ITEMS = [
  'dailyBiasSet',
  'sessionHighsLowsMarked',
  'premiumDiscountSet',
  'prepCompleted',
  'htLtReviewed',
  'calendarChecked',
  'killzoneSelected',
  'ifvgIdentified',
  'cleanCloseConfirmed',
  'confirmation1',
  'confirmation2',
  'bothAlign',
  'rrConfirmed',
  'consistencyChecked',
  'dailyTargetChecked',
  'slDecided',
  'tpSet',
  'contractsChecked',
];

/**
 * Compute checklist verdict.
 *
 * Rules:
 *  - Any MUST item unchecked → DO_NOT_TRADE
 *  - All MUST items checked + 85%+ overall → A_PLUS
 *  - All MUST items checked + 70-84% overall → B_SETUP
 *  - All MUST items checked + below 70% → DO_NOT_TRADE
 *
 * @param {object} checklist - Object with boolean fields
 * @returns {'A_PLUS' | 'B_SETUP' | 'DO_NOT_TRADE'}
 */
function computeVerdict(checklist) {
  // Check MUST items
  const mustsPassed = MUST_ITEMS.every((key) => checklist[key] === true);
  if (!mustsPassed) {
    return 'DO_NOT_TRADE';
  }

  // Compute overall percentage
  const checkedCount = ALL_ITEMS.filter((key) => checklist[key] === true).length;
  const percentage = (checkedCount / ALL_ITEMS.length) * 100;

  if (percentage >= 85) {
    return 'A_PLUS';
  } else if (percentage >= 70) {
    return 'B_SETUP';
  } else {
    return 'DO_NOT_TRADE';
  }
}

module.exports = { computeVerdict, MUST_ITEMS, ALL_ITEMS };
