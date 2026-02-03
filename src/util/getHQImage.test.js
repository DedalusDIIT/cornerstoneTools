import external from '../externalModules.js';
import { getToolState } from '../stateManagement/toolState.js';
import getHQImage from './getHQImage.js';

jest.mock('../externalModules.js');
jest.mock('../stateManagement/toolState.js');

describe('util/getHQImage.js', () => {
  let testElement;
  let fallbackImage;

  beforeEach(() => {
    testElement = document.createElement('div');
    fallbackImage = { imageId: 'fallback-image-id' };
    jest.clearAllMocks();
  });

  describe('getHQImage', () => {
    it('returns fallback image when LQ stack data is not available', () => {
      getToolState.mockReturnValue(undefined);

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: fallbackImage,
        hqImageId: undefined,
      });
    });

    it('returns fallback image when LQ stack data has no data array', () => {
      getToolState.mockReturnValueOnce({ data: undefined });

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: fallbackImage,
        hqImageId: undefined,
      });
    });

    it('returns fallback image when LQ stack data array is empty', () => {
      getToolState.mockReturnValueOnce({ data: [] });

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: fallbackImage,
        hqImageId: undefined,
      });
    });

    it('returns fallback image when currentImageIdIndex is undefined', () => {
      getToolState.mockReturnValueOnce({
        data: [{ currentImageIdIndex: undefined }],
      });

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: fallbackImage,
        hqImageId: undefined,
      });
    });

    it('returns fallback image when HQ stack reference is not available', () => {
      getToolState
        .mockReturnValueOnce({ data: [{ currentImageIdIndex: 0 }] })
        .mockReturnValueOnce(undefined);

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: fallbackImage,
        hqImageId: undefined,
      });
    });

    it('returns fallback image when HQ stack reference has no imageIds', () => {
      getToolState
        .mockReturnValueOnce({ data: [{ currentImageIdIndex: 0 }] })
        .mockReturnValueOnce({ data: [{ imageIds: undefined }] });

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: fallbackImage,
        hqImageId: undefined,
      });
    });

    it('returns fallback image when HQ imageId is not available at current index', () => {
      getToolState
        .mockReturnValueOnce({ data: [{ currentImageIdIndex: 5 }] })
        .mockReturnValueOnce({
          data: [{ imageIds: ['hq-image-1', 'hq-image-2'] }],
        });

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: fallbackImage,
        hqImageId: undefined,
      });
    });

    it('returns fallback image when HQ image is not cached', () => {
      const hqImageId = 'hq-image-id-0';

      getToolState
        .mockReturnValueOnce({ data: [{ currentImageIdIndex: 0 }] })
        .mockReturnValueOnce({
          data: [{ imageIds: [hqImageId] }],
        });

      external.cornerstone.imageCache = {
        cachedImages: [],
      };

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: fallbackImage,
        hqImageId: undefined,
      });
    });

    it('returns fallback image when HQ image is cached but not loaded', () => {
      const hqImageId = 'hq-image-id-0';

      getToolState
        .mockReturnValueOnce({ data: [{ currentImageIdIndex: 0 }] })
        .mockReturnValueOnce({
          data: [{ imageIds: [hqImageId] }],
        });

      external.cornerstone.imageCache = {
        cachedImages: [
          {
            imageId: hqImageId,
            loaded: false,
            image: { imageId: hqImageId },
          },
        ],
      };

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: fallbackImage,
        hqImageId: undefined,
      });
    });

    it('returns HQ image when it is cached and loaded', () => {
      const hqImageId = 'hq-image-id-0';
      const hqImage = { imageId: hqImageId, data: 'hq-data' };

      getToolState
        .mockReturnValueOnce({ data: [{ currentImageIdIndex: 0 }] })
        .mockReturnValueOnce({
          data: [{ imageIds: [hqImageId] }],
        });

      external.cornerstone.imageCache = {
        cachedImages: [
          {
            imageId: hqImageId,
            loaded: true,
            image: hqImage,
          },
        ],
      };

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: hqImage,
        hqImageId,
      });
    });

    it('returns HQ image for different indices in the stack', () => {
      const hqImageId1 = 'hq-image-id-1';
      const hqImageId2 = 'hq-image-id-2';
      const hqImage2 = { imageId: hqImageId2, data: 'hq-data-2' };

      getToolState
        .mockReturnValueOnce({ data: [{ currentImageIdIndex: 1 }] })
        .mockReturnValueOnce({
          data: [{ imageIds: [hqImageId1, hqImageId2] }],
        });

      external.cornerstone.imageCache = {
        cachedImages: [
          {
            imageId: hqImageId1,
            loaded: true,
            image: { imageId: hqImageId1 },
          },
          {
            imageId: hqImageId2,
            loaded: true,
            image: hqImage2,
          },
        ],
      };

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: hqImage2,
        hqImageId: hqImageId2,
      });
    });

    it('handles multiple cached images and finds the correct HQ image', () => {
      const hqImageId = 'hq-image-id-target';
      const hqImage = { imageId: hqImageId, data: 'target-data' };

      getToolState
        .mockReturnValueOnce({ data: [{ currentImageIdIndex: 2 }] })
        .mockReturnValueOnce({
          data: [
            {
              imageIds: ['hq-id-0', 'hq-id-1', hqImageId, 'hq-id-3'],
            },
          ],
        });

      external.cornerstone.imageCache = {
        cachedImages: [
          { imageId: 'other-id-1', loaded: true, image: {} },
          { imageId: 'hq-id-0', loaded: true, image: {} },
          { imageId: hqImageId, loaded: true, image: hqImage },
          { imageId: 'other-id-2', loaded: false, image: {} },
        ],
      };

      const result = getHQImage(testElement, fallbackImage);

      expect(result).toEqual({
        image: hqImage,
        hqImageId,
      });
    });
  });
});
