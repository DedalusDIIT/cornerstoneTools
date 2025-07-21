import getProjectionRadiographPixelSpacing from './getProjectionRadiographPixelSpacing';

describe('getProjectionRadiographPixelSpacing', () => {
  it('should return the pixel spacing and correct unit when imager pixel spacing is not present', () => {
    const imagePlane = {
      pixelSpacing: [0.1, 0.1],
    };

    const result = getProjectionRadiographPixelSpacing(imagePlane);

    expect(result).toEqual({
      rowPixelSpacing: 0.1,
      colPixelSpacing: 0.1,
      unit: 'mm_prj',
    });
  });

  it('should return the pixel spacing and correct unit when both imager and pixel spacing are present, but different, and there is no estimation factor', () => {
    const imagePlane = {
      pixelSpacing: [0.2, 0.2],
      imagerPixelSpacing: [0.1, 0.1],
    };

    const result = getProjectionRadiographPixelSpacing(imagePlane);

    expect(result).toEqual({
      rowPixelSpacing: 0.2,
      colPixelSpacing: 0.2,
      unit: 'mm_approx',
    });
  });

  it('should return the pixel spacing and correct unit when both imager and pixel spacing are present, and the same', () => {
    const imagePlane = {
      pixelSpacing: [0.1, 0.1],
      imagerPixelSpacing: [0.1, 0.1],
    };

    const result = getProjectionRadiographPixelSpacing(imagePlane);

    expect(result).toEqual({
      rowPixelSpacing: 0.1,
      colPixelSpacing: 0.1,
      unit: 'mm_prj',
    });
  });

  it('should return the imager pixel spacing and correct unit when both imager and pixel spacing are present, but different, and there is an estimation factor', () => {
    const imagePlane = {
      pixelSpacing: [0.2, 0.2],
      imagerPixelSpacing: [10.0, 10.0],
      estimatedRadiographicMagnificationFactor: 2,
    };

    const result = getProjectionRadiographPixelSpacing(imagePlane);

    expect(result).toEqual({
      rowPixelSpacing: 5.0,
      colPixelSpacing: 5.0,
      unit: 'mm_est',
    });
  });

  it('should return imager pixel spacing and correct unit with no estimation factor when pixel spacing is not present', () => {
    const imagePlane = {
      imagerPixelSpacing: [0.1, 0.1],
    };

    const result = getProjectionRadiographPixelSpacing(imagePlane);

    expect(result).toEqual({
      rowPixelSpacing: 0.1,
      colPixelSpacing: 0.1,
      unit: 'mm_prj',
    });
  });

  it('should return imager pixel spacing and correct unit with estimation factor when pixel spacing is not present', () => {
    const imagePlane = {
      imagerPixelSpacing: [10.0, 10.0],
      estimatedRadiographicMagnificationFactor: 2,
    };

    const result = getProjectionRadiographPixelSpacing(imagePlane);

    expect(result).toEqual({
      rowPixelSpacing: 5.0,
      colPixelSpacing: 5.0,
      unit: 'mm_est',
    });
  });

  it('should consider 0 estimation factor as 1', () => {
    const imagePlane = {
      imagerPixelSpacing: [0.2, 0.2],
      estimatedRadiographicMagnificationFactor: 0,
    };

    const result = getProjectionRadiographPixelSpacing(imagePlane);

    expect(result).toEqual({
      rowPixelSpacing: 0.2,
      colPixelSpacing: 0.2,
      unit: 'mm_est',
    });
  });

  it('should return undefined pixel spacings if both imager and pixel spacing are not present', () => {
    const imagePlane = {};

    const result = getProjectionRadiographPixelSpacing(imagePlane);

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
      unit: 'pix',
    });
  });

  it('should return calibrated rowPixelSpacing and colPixelSpacing from imagePlane if calibration factor is present', () => {
    const imagePlane = {
      imagerPixelSpacing: [0.2, 0.2],
      calibrationFactor: 4,
    };

    const result = getProjectionRadiographPixelSpacing(imagePlane);

    expect(result).toEqual({
      rowPixelSpacing: 0.8,
      colPixelSpacing: 0.8,
      unit: 'mm_man',
    });
  });

  it('should return undefined pixel spacing and pix units when pixel spacing is missing but calibration factor exists', () => {
    const imagePlane = {
      calibrationFactor: 4,
    };

    const result = getProjectionRadiographPixelSpacing(imagePlane, null);

    expect(result).toEqual({
      colPixelSpacing: undefined,
      rowPixelSpacing: undefined,
      unit: 'pix',
    });
  });

  it('should return pix units when calibration was reset on the FIRST calibration', () => {
    const imagePlane = {
      imagerPixelSpacing: [10, 20],
      calibrationFactor: 1,
      calibrationReset: true,
      isFirstCalibration: true,
    };

    const result = getProjectionRadiographPixelSpacing(imagePlane, null);

    expect(result).toEqual({
      rowPixelSpacing: 10,
      colPixelSpacing: 20,
      unit: 'pix',
    });
  });

  it('should return mm_man units when calibration was reset AFTER at least one previous calibration', () => {
    const imagePlane = {
      imagerPixelSpacing: [10, 20],
      calibrationFactor: 1,
      calibrationReset: true,
      isFirstCalibration: false,
    };

    const result = getProjectionRadiographPixelSpacing(imagePlane, null);

    expect(result).toEqual({
      rowPixelSpacing: 10,
      colPixelSpacing: 20,
      unit: 'mm_man',
    });
  });
});
