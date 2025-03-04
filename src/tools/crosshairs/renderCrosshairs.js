import external from './../../externalModules.js';
import convertToVector3 from './../../util/convertToVector3.js';
import { draw, drawLine } from './../../drawing/index.js';
import { projectPatientPointToImagePlane } from '../../util/pointProjector.js';

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

  const color = '#A8D7FD';

  // Draw the crosshairs
  context.setTransform(1, 0, 0, 1, 0, 0);

  const verticalLine1Start = { x: projectedPatientPoint.x, y: 0 };
  const verticalLine1End = {
    x: projectedPatientPoint.x,
    y: projectedPatientPoint.y - 15,
  };
  const verticalLine2Start = {
    x: projectedPatientPoint.x,
    y: projectedPatientPoint.y + 15,
  };
  const verticalLine2End = {
    x: projectedPatientPoint.x,
    y: referenceImage.height,
  };
  const horizontalLine1Start = { x: 0, y: projectedPatientPoint.y };
  const horizontalLine1End = {
    x: projectedPatientPoint.x - 15,
    y: projectedPatientPoint.y,
  };
  const horizontalLine2Start = {
    x: projectedPatientPoint.x + 15,
    y: projectedPatientPoint.y,
  };
  const horizontalLine2End = {
    x: referenceImage.width,
    y: projectedPatientPoint.y,
  };

  draw(context, context => {
    drawLine(context, referenceElement, verticalLine1Start, verticalLine1End, {
      color,
    });

    drawLine(context, referenceElement, verticalLine2Start, verticalLine2End, {
      color,
    });

    drawLine(
      context,
      referenceElement,
      horizontalLine1Start,
      horizontalLine1End,
      {
        color,
      }
    );

    drawLine(
      context,
      referenceElement,
      horizontalLine2Start,
      horizontalLine2End,
      {
        color,
      }
    );
  });
}
