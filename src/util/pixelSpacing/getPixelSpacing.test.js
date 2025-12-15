import getPixelSpacing from './getPixelSpacing';
import external from '../../externalModules.js';
import getUltraSoundPixelSpacing from './getUltraSoundPixelSpacing.js';
import getProjectionRadiographPixelSpacing from './getProjectionRadiographPixelSpacing.js';

jest.mock('../../externalModules.js', () => ({
  cornerstone: {
    metaData: {
      get: jest.fn(),
    },
  },
}));
jest.mock('./getUltraSoundPixelSpacing');
jest.mock('./getProjectionRadiographPixelSpacing');

describe('getPixelSpacing', () => {
  it('should call getUltraSoundPixelSpacing if ultrasoundRegionSequence is present', () => {
    const image = {
      imageId: 'imageId',
    };

    const measurementData = {
      handles: {
        start: { x: 1, y: 2 },
        end: { x: 3, y: 4 },
      },
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      ultrasoundRegionSequence: [
        {
          physicalUnitsXDirection: 3,
          physicalUnitsYDirection: 3,
          physicalDeltaX: 1,
          physicalDeltaY: 1,
          regionLocationMinX0: 0,
          regionLocationMinY0: 0,
          regionLocationMaxX1: 4,
          regionLocationMaxY1: 4,
        },
      ],
    });

    getPixelSpacing(image, measurementData);

    expect(getUltraSoundPixelSpacing).toHaveBeenCalledTimes(1);
  });

  it('should return rowPixelSpacing and colPixelSpacing from imagePlane if module is present', () => {
    const image = {
      imageId: 'imageId',
      rowPixelSpacing: 2,
      columnPixelSpacing: 3,
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      rowPixelSpacing: 10,
      columnPixelSpacing: 20,
    });

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: 10,
      colPixelSpacing: 20,
      unit: 'mm',
    });
  });

  it('should return rowPixelSpacing and colPixelSpacing from image when both imagePlane and sopCommon modules are not present', () => {
    const image = {
      imageId: 'imageId',
      rowPixelSpacing: 5,
      columnPixelSpacing: 6,
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue(null);

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: 5,
      colPixelSpacing: 6,
      unit: 'mm',
    });
  });

  it('should return pix units if pixel spacing is not present', () => {
    const image = {
      imageId: 'imageId',
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue(null);

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
      unit: 'pix',
    });
  });

  it('should call getProjectionRadiographicPixelSpacing if the image is of a projection radiograph SOP class', () => {
    const image = {
      imageId: 'imageId',
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      sopClassUid: '1.2.840.10008.5.1.4.1.1.1.2',
    });

    getPixelSpacing(image, null);

    expect(getProjectionRadiographPixelSpacing).toHaveBeenCalledTimes(1);
  });

  it('should return calibrated rowPixelSpacing and colPixelSpacing from imagePlane if calibration factor is present', () => {
    const image = {
      imageId: 'imageId',
      rowPixelSpacing: 2,
      columnPixelSpacing: 3,
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      rowPixelSpacing: 10,
      columnPixelSpacing: 20,
      calibrationFactor: 5,
    });

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: 50,
      colPixelSpacing: 100,
      unit: 'mm_man',
    });
  });

  it('should return calibration factor as pixel spacing and mm_man units if pixel spacing is not present and calibration factor is present', () => {
    const image = {
      imageId: 'imageId',
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      calibrationFactor: 5,
    });

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      colPixelSpacing: 5,
      rowPixelSpacing: 5,
      unit: 'mm_man',
    });
  });

  it('should return pix units when calibration was reset on the FIRST calibration', () => {
    const image = { imageId: 'imageId' };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      rowPixelSpacing: 10,
      columnPixelSpacing: 20,
      calibrationFactor: 1,
      calibrationReset: true,
      isFirstCalibration: true,
    });

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: 10,
      colPixelSpacing: 20,
      unit: 'pix',
    });
  });

  it('should return mm_man units when calibration was reset AFTER at least one previous calibration', () => {
    const image = { imageId: 'imageId' };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      rowPixelSpacing: 10,
      columnPixelSpacing: 20,
      calibrationFactor: 1,
      calibrationReset: true,
      isFirstCalibration: false,
    });

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: 10,
      colPixelSpacing: 20,
      unit: 'mm_man',
    });
  });

  it('scales column spacing when displayed columns differ from stored columns', () => {
    const image = {
      imageId: 'imageId',
      columns: 50,
      rows: 100,
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockImplementation(type => {
      if (type === 'imagePlaneModule') {
        return {
          rowPixelSpacing: 1,
          columnPixelSpacing: 2,
        };
      }

      if (type === 'sopCommonModule') {
        return null;
      }

      if (type === 'rows') {
        return {
          rows: 100,
          columns: 100,
        };
      }

      return null;
    });

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: 1,
      colPixelSpacing: 4,
      unit: 'mm',
    });
  });

  it('scales row spacing when displayed rows differ from stored rows', () => {
    const image = {
      imageId: 'imageId',
      columns: 100,
      rows: 50,
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockImplementation(type => {
      if (type === 'imagePlaneModule') {
        return {
          rowPixelSpacing: 2,
          columnPixelSpacing: 4,
        };
      }

      if (type === 'sopCommonModule') {
        return null;
      }

      if (type === 'rows') {
        return {
          rows: 100,
          columns: 100,
        };
      }

      return null;
    });

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: 4,
      colPixelSpacing: 4,
      unit: 'mm',
    });
  });

  it('scales both row and column spacing when both dimensions differ', () => {
    const image = {
      imageId: 'imageId',
      columns: 50,
      rows: 25,
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockImplementation(type => {
      if (type === 'imagePlaneModule') {
        return {
          rowPixelSpacing: 2,
          columnPixelSpacing: 3,
        };
      }

      if (type === 'sopCommonModule') {
        return null;
      }

      if (type === 'rows') {
        return {
          rows: 100,
          columns: 100,
        };
      }

      return null;
    });

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: 8,
      colPixelSpacing: 6,
      unit: 'mm',
    });
  });
});
