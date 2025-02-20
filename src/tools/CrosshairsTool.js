import BaseTool from './base/BaseTool.js';
import external from './../externalModules.js';

import loadHandlerManager from '../stateManagement/loadHandlerManager.js';
import {
  addToolState,
  getToolState,
  clearToolState,
} from '../stateManagement/toolState.js';
import { imagePointToPatientPoint } from '../util/pointProjector.js';
import convertToVector3 from '../util/convertToVector3.js';
import { setToolOptions } from '../toolOptions.js';
import { crosshairsCursor } from './cursors/index.js';

/**
 * @public
 * @class CrosshairsTool
 * @memberof Tools
 *
 * @classdesc Tool for finding the slice in another element corresponding to the
 * image position in a synchronized image series.
 * @extends Tools.Base.BaseTool
 */
export default class CrosshairsTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Crosshairs',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: crosshairsCursor,
    };

    super(props, defaultProps);

    this.preMouseDownCallback = this._chooseLocation.bind(this);
    this.mouseDragCallback = this._chooseLocation.bind(this);
    this.touchDragCallback = this._chooseLocation.bind(this);
  }

  mergeOptions(options) {
    super.mergeOptions(options);

    if (options.toolCallback) {
      this.toolCallback = options.toolCallback;
    }
  }

  _chooseLocation(evt) {
    const eventData = evt.detail;
    const { element } = eventData;

    // Prevent CornerstoneToolsTouchStartActive from killing any press events
    evt.stopImmediatePropagation();

    // If we have no toolData for this element, return immediately as there is nothing to do
    const toolData = getToolState(element, this.name);

    if (!toolData) {
      return;
    }

    // Get current element target information
    const sourceElement = element;
    const sourceEnabledElement = external.cornerstone.getEnabledElement(
      sourceElement
    );
    const sourceImageId = sourceEnabledElement.image.imageId;
    const sourceImagePlane = external.cornerstone.metaData.get(
      'imagePlaneModule',
      sourceImageId
    );

    if (
      !sourceImagePlane ||
      !sourceImagePlane.rowCosines ||
      !sourceImagePlane.columnCosines ||
      !sourceImagePlane.imagePositionPatient ||
      !sourceImagePlane.columnPixelSpacing ||
      !sourceImagePlane.rowPixelSpacing
    ) {
      return;
    }

    // Get currentPoints from mouse cursor on selected element
    const sourceImagePoint = eventData.currentPoints.image;

    // Transfer this to a patientPoint given imagePlane metadata
    const patientPoint = imagePointToPatientPoint(
      sourceImagePoint,
      sourceImagePlane
    );

    // Get the enabled elements associated with this synchronization context
    const syncContext = toolData.data[0].synchronizationContext;
    const enabledElements = syncContext.getSourceElements();

    // Iterate over each synchronized element
    enabledElements.forEach(targetElement => {
      // Don't do anything if the target is the same as the source
      if (targetElement === sourceElement) {
        return;
      }

      let minDistance = Number.MAX_VALUE;
      let newImageIdIndex = -1;

      const stackToolDataSource = getToolState(targetElement, 'stack');

      if (stackToolDataSource === undefined) {
        return;
      }

      const stackData = stackToolDataSource.data[0];

      // Find within the element's stack the closest image plane to selected location
      stackData.imageIds.forEach(function(imageId, index) {
        const imagePlane = external.cornerstone.metaData.get(
          'imagePlaneModule',
          imageId
        );

        // Skip if the image plane is not ready
        if (
          !imagePlane ||
          !imagePlane.imagePositionPatient ||
          !imagePlane.rowCosines ||
          !imagePlane.columnCosines
        ) {
          return;
        }

        const imagePosition = convertToVector3(imagePlane.imagePositionPatient);
        const row = convertToVector3(imagePlane.rowCosines);
        const column = convertToVector3(imagePlane.columnCosines);
        const normal = column.clone().cross(row.clone());
        const distance = Math.abs(
          normal.clone().dot(imagePosition) - normal.clone().dot(patientPoint)
        );

        if (distance < minDistance) {
          minDistance = distance;
          newImageIdIndex = index;
        }
      });

      if (newImageIdIndex === stackData.currentImageIdIndex) {
        return;
      }

      // Switch the loaded image to the required image
      if (
        newImageIdIndex !== -1 &&
        stackData.imageIds[newImageIdIndex] !== undefined
      ) {
        const startLoadingHandler = loadHandlerManager.getStartLoadHandler(
          targetElement
        );
        const endLoadingHandler = loadHandlerManager.getEndLoadHandler(
          targetElement
        );
        const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler(
          targetElement
        );

        if (startLoadingHandler) {
          startLoadingHandler(targetElement);
        }

        let loader;

        if (stackData.preventCache === true) {
          loader = external.cornerstone.loadImage(
            stackData.imageIds[newImageIdIndex]
          );
        } else {
          loader = external.cornerstone.loadAndCacheImage(
            stackData.imageIds[newImageIdIndex]
          );
        }

        loader.then(
          image => {
            const viewport = external.cornerstone.getViewport(targetElement);

            stackData.currentImageIdIndex = newImageIdIndex;
            external.cornerstone.displayImage(targetElement, image, viewport);

            this.toolCallback(targetElement, image.imageId, newImageIdIndex);

            if (endLoadingHandler) {
              endLoadingHandler(targetElement, image);
            }
          },
          error => {
            const imageId = stackData.imageIds[newImageIdIndex];

            if (errorLoadingHandler) {
              errorLoadingHandler(targetElement, imageId, error);
            }
          }
        );
      }
    });
  }

  activeCallback(element, { mouseButtonMask, synchronizationContext }) {
    setToolOptions(this.name, element, { mouseButtonMask });

    // Clear any currently existing toolData
    clearToolState(element, this.name);

    addToolState(element, this.name, {
      synchronizationContext,
    });
  }
}
