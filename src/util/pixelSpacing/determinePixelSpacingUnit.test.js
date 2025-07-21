import { determinePixelSpacingUnit } from './determinePixelSpacingUnit';

describe('determinePixelSpacingUnit', () => {
  it('should return mm_man when hasCalibrationFactor is true regardless of other params', () => {
    expect(determinePixelSpacingUnit(true, true, false, false)).toBe('mm_man');
    expect(determinePixelSpacingUnit(false, true, true, true)).toBe('mm_man');
    expect(determinePixelSpacingUnit(false, true, false, false, 'pix')).toBe(
      'mm_man'
    );
  });

  it('should handle calibrationReset scenarios correctly', () => {
    expect(determinePixelSpacingUnit(false, false, true, true)).toBe('pix');
    expect(determinePixelSpacingUnit(true, false, true, false)).toBe('mm_man');
    expect(determinePixelSpacingUnit(false, false, true, false)).toBe('mm_man');
  });

  it('should respect baseUnit when hasPixelSpacing is true', () => {
    expect(determinePixelSpacingUnit(true, false, false, false, 'pix')).toBe(
      'pix'
    );
    expect(determinePixelSpacingUnit(true, false, false, false, 'mm')).toBe(
      'mm'
    );
  });

  it('should return pix when no conditions are met', () => {
    expect(determinePixelSpacingUnit(false, false, false, false)).toBe('pix');
    expect(determinePixelSpacingUnit(false, false, false, false, 'mm')).toBe(
      'pix'
    );
  });

  it('should handle undefined and null parameters', () => {
    expect(determinePixelSpacingUnit(undefined, false, false, false)).toBe(
      'pix'
    );
    expect(determinePixelSpacingUnit(null, false, false, false)).toBe('pix');
    expect(determinePixelSpacingUnit(true, null, undefined, false)).toBe('mm');
  });
});
