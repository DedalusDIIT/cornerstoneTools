import external from './../../externalModules.js';
import convertToVector3 from './../../util/convertToVector3.js';
import { draw, drawLine } from './../../drawing/index.js';
import { projectPatientPointToImagePlane } from '../../util/pointProjector.js';

function getSafeRatio(numerator, denominator) {
  if (!numerator || !denominator) {
    return 1;
  }

  const ratio = numerator / denominator;

  return Number.isFinite(ratio) ? ratio : 1;
}

/**
 * Renders the livesync crosshairs.
 *
 * @export @public @method
 * @name renderCrosshairs
 * @param  {Object} context        The canvas context.
 * @param  {Object} eventData      The data associated with the event.
 * @param  {HTMLElement} targetElement
 * @param  {HTMLElement} referenceElement
 * @returns {void}
 */
export default function(
  context,
  eventData,
  targetElement,
  referenceElement,
  patientPoint
) {
  const cornerstone = external.cornerstone;
  const targetImage = cornerstone.getEnabledElement(targetElement).image;
  const referenceImage = cornerstone.getEnabledElement(referenceElement).image;

  // Make sure the images are actually loaded for the target and reference
  if (!targetImage || !referenceImage) {
    return;
  }

  const targetImagePlane = cornerstone.metaData.get(
    'imagePlaneModule',
    targetImage.imageId
  );
  const referenceImagePlane = cornerstone.metaData.get(
    'imagePlaneModule',
    referenceImage.imageId
  );

  // Make sure the target and reference actually have image plane metadata
  if (
    !targetImagePlane ||
    !referenceImagePlane ||
    !targetImagePlane.rowCosines ||
    !targetImagePlane.columnCosines ||
    !targetImagePlane.imagePositionPatient ||
    !referenceImagePlane.rowCosines ||
    !referenceImagePlane.columnCosines ||
    !referenceImagePlane.imagePositionPatient
  ) {
    return;
  }

  // The image planes must be in the same frame of reference
  if (
    targetImagePlane.frameOfReferenceUID !==
    referenceImagePlane.frameOfReferenceUID
  ) {
    return;
  }

  targetImagePlane.rowCosines = convertToVector3(targetImagePlane.rowCosines);
  targetImagePlane.columnCosines = convertToVector3(
    targetImagePlane.columnCosines
  );
  targetImagePlane.imagePositionPatient = convertToVector3(
    targetImagePlane.imagePositionPatient
  );
  referenceImagePlane.rowCosines = convertToVector3(
    referenceImagePlane.rowCosines
  );
  referenceImagePlane.columnCosines = convertToVector3(
    referenceImagePlane.columnCosines
  );
  referenceImagePlane.imagePositionPatient = convertToVector3(
    referenceImagePlane.imagePositionPatient
  );

  const projectedPatientPoint = projectPatientPointToImagePlane(
    patientPoint,
    referenceImagePlane
  );

  const referenceColumns = referenceImage.columns || referenceImage.width;
  const referenceRows = referenceImage.rows || referenceImage.height;
  const ratioX = getSafeRatio(referenceColumns, referenceImagePlane.columns);
  const ratioY = getSafeRatio(referenceRows, referenceImagePlane.rows);
  const adjustedPatientPoint = {
    x: projectedPatientPoint.x * ratioX,
    y: projectedPatientPoint.y * ratioY,
  };

  const color = '#A8D7FD';

  // Draw the crosshairs
  context.setTransform(1, 0, 0, 1, 0, 0);

  const boundaryCoordinates = {
    x: Math.max(0, Math.min(referenceColumns, adjustedPatientPoint.x)),
    y: Math.max(0, Math.min(referenceRows, adjustedPatientPoint.y)),
  };

  const gapSize = 15;

  // Calculate vertical line segments with boundary checks
  let verticalLine1Start,
    verticalLine1End,
    verticalLine2Start,
    verticalLine2End;

  if (boundaryCoordinates.y - gapSize > 0) {
    verticalLine1Start = { x: boundaryCoordinates.x, y: 0 };
    verticalLine1End = {
      x: boundaryCoordinates.x,
      y: boundaryCoordinates.y - gapSize,
    };
  } else {
    verticalLine1Start = verticalLine1End = null;
  }

  if (boundaryCoordinates.y + gapSize < referenceRows) {
    verticalLine2Start = {
      x: boundaryCoordinates.x,
      y: boundaryCoordinates.y + gapSize,
    };
    verticalLine2End = { x: boundaryCoordinates.x, y: referenceRows };
  } else {
    verticalLine2Start = verticalLine2End = null;
  }

  // Calculate horizontal line segments with boundary checks
  let horizontalLine1Start,
    horizontalLine1End,
    horizontalLine2Start,
    horizontalLine2End;

  if (boundaryCoordinates.x - gapSize > 0) {
    horizontalLine1Start = { x: 0, y: boundaryCoordinates.y };
    horizontalLine1End = {
      x: boundaryCoordinates.x - gapSize,
      y: boundaryCoordinates.y,
    };
  } else {
    horizontalLine1Start = horizontalLine1End = null;
  }

  if (boundaryCoordinates.x + gapSize < referenceColumns) {
    horizontalLine2Start = {
      x: boundaryCoordinates.x + gapSize,
      y: boundaryCoordinates.y,
    };
    horizontalLine2End = { x: referenceColumns, y: boundaryCoordinates.y };
  } else {
    horizontalLine2Start = horizontalLine2End = null;
  }

  draw(context, context => {
    // Only draw lines if their endpoints are valid
    if (verticalLine1Start && verticalLine1End) {
      drawLine(
        context,
        referenceElement,
        verticalLine1Start,
        verticalLine1End,
        {
          color,
        }
      );
    }

    if (verticalLine2Start && verticalLine2End) {
      drawLine(
        context,
        referenceElement,
        verticalLine2Start,
        verticalLine2End,
        {
          color,
        }
      );
    }

    if (horizontalLine1Start && horizontalLine1End) {
      drawLine(
        context,
        referenceElement,
        horizontalLine1Start,
        horizontalLine1End,
        {
          color,
        }
      );
    }

    if (horizontalLine2Start && horizontalLine2End) {
      drawLine(
        context,
        referenceElement,
        horizontalLine2Start,
        horizontalLine2End,
        {
          color,
        }
      );
    }
  });
}
