import external from '../../externalModules';
import getUltraSoundPixelSpacing from './getUltraSoundPixelSpacing';
import getProjectionRadiographPixelSpacing from './getProjectionRadiographPixelSpacing';
import { determinePixelSpacingUnit } from './determinePixelSpacingUnit';

export default function getPixelSpacing(image, measurementData) {
  const pixelSpacing = getBasicPixelSpacing(image, measurementData);
  return getCorrectedPixelSpacing(pixelSpacing, image);
}

const getCorrectedPixelSpacing = (pixelSpacing, image) => {
  if (!pixelSpacing) {
    return pixelSpacing;
  }

  const { rowPixelSpacing, colPixelSpacing, unit } = pixelSpacing;

  if (!hasValue(rowPixelSpacing) || !hasValue(colPixelSpacing)) {
    return pixelSpacing;
  }

  const storedSize = external.cornerstone.metaData.get('rows', image.imageId);

  const storedColumns = storedSize && storedSize.columns;
  const storedRows = storedSize && storedSize.rows;
  const displayColumns = image && image.columns;
  const displayRows = image && image.rows;

  if (
    !canScalePixelSpacing(
      storedColumns,
      storedRows,
      displayColumns,
      displayRows
    )
  ) {
    return pixelSpacing;
  }

  const imageRatioX = displayColumns / storedColumns;
  const imageRatioY = displayRows / storedRows;

  if (!isFinite(imageRatioX) || !isFinite(imageRatioY)) {
    return pixelSpacing;
  }

  return {
    rowPixelSpacing: rowPixelSpacing / imageRatioY,
    colPixelSpacing: colPixelSpacing / imageRatioX,
    unit,
  };
};

const hasValue = value => value !== undefined && value !== null;

const canScalePixelSpacing = (
  storedColumns,
  storedRows,
  displayColumns,
  displayRows
) =>
  hasValue(storedColumns) &&
  hasValue(storedRows) &&
  hasValue(displayColumns) &&
  hasValue(displayRows) &&
  isFinite(storedColumns) &&
  isFinite(storedRows) &&
  isFinite(displayColumns) &&
  isFinite(displayRows);

const getBasicPixelSpacing = (image, measurementData) => {
  const imagePlane = external.cornerstone.metaData.get(
    'imagePlaneModule',
    image.imageId
  );

  const sopCommonModule = external.cornerstone.metaData.get(
    'sopCommonModule',
    image.imageId
  );

  if (
    measurementData &&
    sopCommonModule &&
    sopCommonModule.ultrasoundRegionSequence &&
    sopCommonModule.ultrasoundRegionSequence.length > 0
  ) {
    return getUltraSoundPixelSpacing(
      sopCommonModule.ultrasoundRegionSequence,
      measurementData
    );
  }

  if (imagePlane) {
    if (isProjection(imagePlane)) {
      return getProjectionRadiographPixelSpacing(imagePlane);
    }

    return getPixelSpacingAndUnit(imagePlane);
  }

  return getPixelSpacingAndUnit(image);
};

const isProjection = imagePlane => {
  const { sopClassUid } = imagePlane;
  const projectionRadiographSOPClassUIDs = [
    '1.2.840.10008.5.1.4.1.1.1', // Computed Radiography Image Storage
    '1.2.840.10008.5.1.4.1.1.1.1', // Digital X-Ray Image Storage for Presentation
    '1.2.840.10008.5.1.4.1.1.1.2', // Digital Mammography X-Ray Image Storage for Presentation
    '1.2.840.10008.5.1.4.1.1.1.2.1', // Digital Mammography X-Ray Image Storage for Processing
    '1.2.840.10008.5.1.4.1.1.1.3', // Digital Intraoral X-Ray Image Storage for Presentation
    '1.2.840.10008.5.1.4.1.1.1.3.1', // Digital Intraoral X-Ray Image Storage for Processing
    '1.2.840.10008.5.1.4.1.1.12.1', // X-Ray Angiographic Image Storage
    '1.2.840.10008.5.1.4.1.1.12.1.1', // Enhanced XA Image Storage
    '1.2.840.10008.5.1.4.1.1.12.2', // X-Ray Radiofluoroscopic Image Storage
    '1.2.840.10008.5.1.4.1.1.12.2.1', // Enhanced XRF Image Storage
  ];

  return projectionRadiographSOPClassUIDs.includes(sopClassUid);
};

const getPixelSpacingAndUnit = obj => {
  const baseRowPixelSpacing = obj.rowPixelSpacing || obj.rowImagePixelSpacing;
  const baseColPixelSpacing =
    obj.columnPixelSpacing || obj.colImagePixelSpacing;

  const rowPixelSpacing = baseRowPixelSpacing
    ? baseRowPixelSpacing * (obj.calibrationFactor || 1)
    : obj.calibrationFactor;
  const colPixelSpacing = baseColPixelSpacing
    ? baseColPixelSpacing * (obj.calibrationFactor || 1)
    : obj.calibrationFactor;
  const hasPixelSpacing = rowPixelSpacing && colPixelSpacing;
  const hasCalibrationFactor =
    obj.calibrationFactor && obj.calibrationFactor !== 1;

  const unit = determinePixelSpacingUnit(
    hasPixelSpacing,
    hasCalibrationFactor,
    obj.calibrationReset,
    obj.isFirstCalibration
  );

  return {
    rowPixelSpacing,
    colPixelSpacing,
    unit,
  };
};
