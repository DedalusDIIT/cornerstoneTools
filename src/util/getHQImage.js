import external from '../externalModules.js';
import { getToolState } from '../stateManagement/toolState.js';

/**
 * Attempts to retrieve the high quality (HQ) version of the currently displayed image.
 * Uses an index-based approach to map between LQ and HQ image stacks.
 *
 * @param {HTMLElement} element - The enabled element
 * @param {Object} fallbackImage - The fallback image to use if HQ image is not available
 * @returns {Object} The HQ image if available and cached, otherwise the fallback image
 */
export default function getHQImage(element, fallbackImage) {
  // Get current LQ image index
  const lqStackData = getToolState(element, 'stack');
  const currentImageIdIndex =
    lqStackData && lqStackData.data && lqStackData.data[0]
      ? lqStackData.data[0].currentImageIdIndex
      : undefined;

  // Get HQ stack reference (persists across all images in stack)
  const hqStackData = getToolState(element, 'hqStackReference');
  const hqImageIds =
    hqStackData && hqStackData.data && hqStackData.data[0]
      ? hqStackData.data[0].imageIds
      : undefined;

  // Use HQ image if available, otherwise fall back to provided image
  if (
    currentImageIdIndex !== undefined &&
    hqImageIds &&
    hqImageIds[currentImageIdIndex]
  ) {
    const hqImageId = hqImageIds[currentImageIdIndex];
    const cachedHQImage = external.cornerstone.imageCache.cachedImages.find(
      function(img) {
        return img.imageId === hqImageId && img.loaded;
      }
    );

    if (cachedHQImage && cachedHQImage.loaded) {
      return {
        image: cachedHQImage.image,
        hqImageId,
      };
    }
  }

  return {
    image: fallbackImage,
    hqImageId: undefined,
  };
}
