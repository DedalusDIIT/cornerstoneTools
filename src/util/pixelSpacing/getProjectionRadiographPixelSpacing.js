import { determineUnit } from './determinePixelSpacingUnit';

/**
 * The logic of this code is based on the DICOM standard part 3, section 10.7,
 * see https://dicom.nema.org/dicom/2013/output/chtml/part03/sect_10.7.html
 * especially section 10.7.1.1 Pixel Spacing.
 * The determination of units is done the same way as in the Diagnost Client,
 * see impaxee/com.agfa.pacs.impaxee/src/main/java/com/tiani/jvision/image/fithandler/SpacingDef.java
 * @param {Object} imagePlane
 * @returns {Object}
 */
export default function getProjectionRadiographPixelSpacing(imagePlane) {
  const imagerPixelSpacing = imagePlane.imagerPixelSpacing || [];
  const pixelSpacing = imagePlane.pixelSpacing || [];
  const hasCalibrationFactor =
    imagePlane.calibrationFactor && imagePlane.calibrationFactor !== 1;
  const calibrationFactor = imagePlane.calibrationFactor || 1;

  // ********************* CASE 1 *********************************
  // Pixel Spacing is present, Imager Pixel Spacing is not
  // meaning that it cannot be determined whether or not
  // correction or calibration have been performed.
  // Unit is mm_prj (projective)
  // **************************************************************
  if (pixelSpacing.length > 0 && imagerPixelSpacing.length === 0) {
    const unit = determineUnit(
      true,
      hasCalibrationFactor,
      imagePlane.calibrationReset,
      imagePlane.isFirstCalibration,
      'mm_prj'
    );

    return {
      rowPixelSpacing: pixelSpacing[0] * calibrationFactor,
      colPixelSpacing: pixelSpacing[1] * calibrationFactor,
      unit,
    };
  } else if (imagerPixelSpacing.length > 0 && pixelSpacing.length > 0) {
    // ********************* CASE 2 *********************************
    // Pixel Spacing and Imager Pixel Spacing are the same
    // per standard this means that the image has not been calibrated
    // to correct for the effects of geometric magnification
    // the measurements are at the detector plane.
    // Unit is mm_prj (projective) or mm_est (estimated)
    // **************************************************************
    if (
      areTheSame(imagerPixelSpacing, pixelSpacing) ||
      estimatedRadiographicMagnificationFactorExists(imagePlane)
    ) {
      return getProjectivePixelSpacing(imagePlane);
    }

    // ********************* CASE 3 *********************************
    // Pixel Spacing and Imager Pixel Spacing are different
    // meaning the image has been corrected for known or assumed
    // geometric magnification or calibrated with respect to some
    // object of known size at known depth within the patient.
    // Unit is mm_approx (approximate)
    // **************************************************************
    const unit = determineUnit(
      true,
      hasCalibrationFactor,
      imagePlane.calibrationReset,
      imagePlane.isFirstCalibration,
      'mm_approx'
    );

    return {
      rowPixelSpacing: pixelSpacing[0] * calibrationFactor,
      colPixelSpacing: pixelSpacing[1] * calibrationFactor,
      unit,
    };
  } else if (pixelSpacing.length === 0 && imagerPixelSpacing.length > 0) {
    // ********************* CASE 4 *********************************
    // Pixel Spacing is not present, Imager Pixel Spacing is present
    // if there is the estimated radiographic magnification factor
    // we can estimate the pixel spacing and the unit is mm_est
    // otherwise the unit is mm_prj (projective)
    // **************************************************************
    return getProjectivePixelSpacing(imagePlane);
  }

  return {
    rowPixelSpacing: undefined,
    colPixelSpacing: undefined,
    unit: 'pix',
  };
}

const getProjectivePixelSpacing = imagePlane => {
  const hasCalibrationFactor =
    imagePlane.calibrationFactor && imagePlane.calibrationFactor !== 1;
  const calibrationFactor = imagePlane.calibrationFactor || 1;

  const estimatedRadiographicMagnificationFactor =
    imagePlane.estimatedRadiographicMagnificationFactor || 1;

  const baseRowPixelSpacing =
    imagePlane.imagerPixelSpacing[0] / estimatedRadiographicMagnificationFactor;
  const baseColPixelSpacing =
    imagePlane.imagerPixelSpacing[1] / estimatedRadiographicMagnificationFactor;

  const baseUnit = estimatedRadiographicMagnificationFactorExists(imagePlane)
    ? 'mm_est'
    : 'mm_prj';

  const unit = determineUnit(
    true,
    hasCalibrationFactor,
    imagePlane.calibrationReset,
    imagePlane.isFirstCalibration,
    baseUnit
  );

  return {
    rowPixelSpacing: baseRowPixelSpacing * calibrationFactor,
    colPixelSpacing: baseColPixelSpacing * calibrationFactor,
    unit,
  };
};

const EPSILON = 1e-6;

const areTheSame = (a, b) =>
  Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON;

const estimatedRadiographicMagnificationFactorExists = imagePlane =>
  imagePlane.estimatedRadiographicMagnificationFactor ||
  imagePlane.estimatedRadiographicMagnificationFactor === 0;
