/**
 * Questions that are negatively scored (reverse-scored):
 * indices 0,2,4,5,7,9,10,12,14,18 (1-based: 1,3,5,6,8,10,11,13,15,19)
 */
const NEGATIVE_QUESTION_INDICES = new Set([0, 2, 4, 5, 7, 9, 10, 12, 14, 18]);

/**
 * Compute baseline profile from an array of 20 raw scores (1-10 each).
 * Negative questions are reverse-scored: reversedScore = 11 - rawScore
 * Overall score is the average of all adjusted scores mapped to 0-100.
 *
 * @param {number[]} scores - Array of 20 scores, each 1-10
 * @returns {{ overallScore: number, profileType: string }}
 */
function computeBaselineProfile(scores) {
  if (!Array.isArray(scores) || scores.length !== 20) {
    throw new Error('scores must be an array of exactly 20 numbers');
  }

  const adjusted = scores.map((raw, i) => {
    const score = Number(raw);
    if (score < 1 || score > 10) throw new Error(`Score at index ${i} out of range (1-10)`);
    return NEGATIVE_QUESTION_INDICES.has(i) ? 11 - score : score;
  });

  const avg = adjusted.reduce((sum, s) => sum + s, 0) / adjusted.length;
  // Map 1-10 scale to 0-100
  const overallScore = Math.round(((avg - 1) / 9) * 100);

  let profileType;
  if (overallScore >= 80) {
    profileType = 'DISCIPLINED';
  } else if (overallScore >= 60) {
    profileType = 'DEVELOPING';
  } else if (overallScore >= 40) {
    profileType = 'EMOTIONAL';
  } else {
    profileType = 'HIGH_RISK';
  }

  return { overallScore, profileType };
}

/**
 * Compute daily check-in recommendation.
 *
 * @param {{
 *   sleepQuality: number,
 *   stressLevel: number,
 *   confidence: number,
 *   financialPressure: number,
 *   focus: number,
 *   emotionalStability: number,
 *   readiness: number
 * }} scores
 * @returns {{ recommendation: string, overallScore: number }}
 */
function computeCheckinRecommendation(scores) {
  const {
    sleepQuality,
    stressLevel,
    confidence,
    financialPressure,
    focus,
    emotionalStability,
    readiness,
  } = scores;

  // Hard NO_GO conditions
  if (financialPressure >= 8) {
    return { recommendation: 'NO_GO', overallScore: _checkinAverage(scores) };
  }
  if (sleepQuality <= 3) {
    return { recommendation: 'NO_GO', overallScore: _checkinAverage(scores) };
  }

  // Count scores below 4
  const allScores = [sleepQuality, stressLevel, confidence, financialPressure, focus, emotionalStability, readiness];
  const lowCount = allScores.filter((s) => s < 4).length;
  if (lowCount >= 2) {
    return { recommendation: 'NO_GO', overallScore: _checkinAverage(scores) };
  }

  const avg = _checkinAverage(scores);

  let recommendation;
  if (avg >= 7) {
    recommendation = 'GO';
  } else if (avg >= 5) {
    recommendation = 'CAUTION';
  } else {
    recommendation = 'NO_GO';
  }

  return { recommendation, overallScore: avg };
}

function _checkinAverage(scores) {
  const vals = [
    scores.sleepQuality,
    scores.stressLevel,
    scores.confidence,
    scores.financialPressure,
    scores.focus,
    scores.emotionalStability,
    scores.readiness,
  ];
  const sum = vals.reduce((a, b) => a + Number(b), 0);
  return Math.round((sum / vals.length) * 10) / 10;
}

module.exports = { computeBaselineProfile, computeCheckinRecommendation };
