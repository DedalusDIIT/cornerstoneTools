/**
 * Determines the appropriate unit for pixel spacing measurements
 * @param {boolean} hasPixelSpacing - Whether pixel spacing is available
 * @param {boolean} hasCalibrationFactor - Whether calibration factor is applied
 * @param {boolean} calibrationReset - Whether calibration was reset
 * @param {boolean} isFirstCalibration - Whether this is the first calibration
 * @param {string} baseUnit - The base unit when no calibration is applied
 * @returns {string} The appropriate unit
 */
export const determineUnit = (
  hasPixelSpacing,
  hasCalibrationFactor,
  calibrationReset,
  isFirstCalibration,
  baseUnit = 'mm'
) => {
  if (hasCalibrationFactor) {
    return 'mm_man';
  }

  if (calibrationReset) {
    return isFirstCalibration ? 'pix' : 'mm_man';
  }

  return hasPixelSpacing ? baseUnit : 'pix';
};
