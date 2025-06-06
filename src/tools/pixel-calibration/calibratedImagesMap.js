/**
 * Map to store calibration factors for images
 * Key: imageId (string)
 * Value: calibrationFactor (number)
 */
const calibratedImagesMap = new Map();

/**
 * Sets the calibration factor for a specific image
 * @param {string} imageId - The image ID to calibrate
 * @param {number} factor - The calibration factor to apply
 * @returns {undefined}
 */
function setImageCalibrationFactor(imageId, factor) {
  calibratedImagesMap.set(imageId, factor);
}

/**
 * Gets the calibration factor for a specific image
 * @param {string} imageId - The image ID to get calibration for
 * @returns {number} The calibration factor, or 1.0 if not set
 */
function getImageCalibrationFactor(imageId) {
  return calibratedImagesMap.has(imageId)
    ? calibratedImagesMap.get(imageId)
    : 1.0;
}

/**
 * Clears the calibration factor for a specific image
 * @param {string} imageId - The image ID to clear calibration for
 * @returns {undefined}
 */
function clearImageCalibrationFactor(imageId) {
  if (calibratedImagesMap.has(imageId)) {
    calibratedImagesMap.delete(imageId);
  }
}

/**
 * Clears all calibration factors
 * @returns {undefined}
 */
function clearAllImageCalibrationFactors() {
  calibratedImagesMap.clear();
}

export {
  setImageCalibrationFactor,
  getImageCalibrationFactor,
  clearImageCalibrationFactor,
  clearAllImageCalibrationFactors,
  calibratedImagesMap,
};
