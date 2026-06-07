/**
 * Utility functions for KCET rank calculations.
 */

/**
 * Calculates a safe borderline rank given a user's KCET rank.
 * @param {number} rank - The user's input rank.
 * @param {number} [factor=0.6] - The safe factor to apply (configurable, defaults to 0.6).
 * @returns {number|null} The calculated borderline rank, or null for invalid input.
 */
export const getBorderlineRank = (rank, factor = 0.6) => {
  if (rank === null || rank === undefined || typeof rank !== 'number' || rank < 0 || isNaN(rank)) {
    return null;
  }
  return Math.floor(rank * factor);
};

/**
 * Calculates a range of ranks (safe, expected, and risky) for college predictions.
 * @param {number} rank - The user's input rank.
 * @param {number} [safeFactor=0.6] - The safe multiplier.
 * @param {number} [riskyFactor=1.2] - The risky multiplier.
 * @returns {Object|null} An object containing the safe, expected, and risky ranks, or null for invalid input.
 */
export const getRankRange = (rank, safeFactor = 0.6, riskyFactor = 1.2) => {
  if (rank === null || rank === undefined || typeof rank !== 'number' || rank < 0 || isNaN(rank)) {
    return null;
  }
  return {
    safe: Math.floor(rank * safeFactor),
    expected: rank,
    risky: Math.floor(rank * riskyFactor)
  };
};

/**
 * Filters and categorizes colleges based on user rank and closing ranks.
 * @param {number} userRank - The user's input rank.
 * @param {Array} colleges - Array of college objects { name, branch, closingRank }.
 * @param {Object} [options] - Configuration for tuning factors.
 * @returns {Object} Categorized colleges { safe, borderline, likely }.
 */
export const filterColleges = (
  userRank,
  colleges,
  { borderlineFactor = 0.6, likelyFactor = 1.2 } = {}
) => {
  const result = { safe: [], borderline: [], likely: [] };

  if (
    userRank === null ||
    userRank === undefined ||
    typeof userRank !== 'number' ||
    userRank < 0 ||
    isNaN(userRank) ||
    !Array.isArray(colleges)
  ) {
    return result;
  }

  const borderlineRank = Math.floor(userRank * borderlineFactor);
  const likelyRankLimit = Math.floor(userRank * likelyFactor);

  for (let i = 0; i < colleges.length; i++) {
    const college = colleges[i];
    const { closingRank } = college;

    if (typeof closingRank !== 'number' || isNaN(closingRank)) {
      continue;
    }

    if (closingRank < borderlineRank) {
      continue; // Ignore colleges that are too risky
    } else if (closingRank >= borderlineRank && closingRank < userRank) {
      result.borderline.push(college);
    } else if (closingRank > userRank && closingRank <= likelyRankLimit) {
      result.likely.push(college);
    } else if (closingRank >= userRank) {
      // Catches closingRank === userRank and closingRank > likelyRankLimit
      result.safe.push(college);
    }
  }

  // Sort all categories ascending by closing rank
  const sortAsc = (a, b) => a.closingRank - b.closingRank;
  result.safe.sort(sortAsc);
  result.borderline.sort(sortAsc);
  result.likely.sort(sortAsc);

  return result;
};
