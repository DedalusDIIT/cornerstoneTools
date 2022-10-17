import {
  formatArea,
  formatLenght,
  formatDiameter,
} from './formatMeasurment.js';

describe('formatMeasurment', () => {
  describe('formatLenght', () => {
    const length = '17,3';
    const uncertainty = '0,4';

    it.each([
      {
        hasPixelSpacing: true,
        displayUncertainties: false,
        expected: '17,3 mm',
      },
      {
        displayUncertainties: true,
        hasPixelSpacing: true,
        expected: '17,3 mm +/- 0,4 mm',
      },
      {
        hasPixelSpacing: false,
        displayUncertainties: false,
        expected: '17,3 pix',
      },
      {
        displayUncertainties: true,
        hasPixelSpacing: false,
        expected: '17,3 pix +/- 0,4 pix',
      },
    ])(
      'should render the right text when %o',
      ({ displayUncertainties, expected, hasPixelSpacing }) => {
        const result = formatLenght(
          length,
          hasPixelSpacing,
          uncertainty,
          displayUncertainties
        );

        expect(result).toEqual(expected);
      }
    );
  });

  describe('formatArea', () => {
    const area = '1260';
    const uncertainty = '180';

    it.each([
      {
        hasPixelSpacing: true,
        displayUncertainties: false,
        expected: 'A: 1260 mm²',
      },
      {
        displayUncertainties: true,
        hasPixelSpacing: true,
        expected: 'A: 1260 mm² +/- 180 mm²',
      },
      {
        hasPixelSpacing: false,
        displayUncertainties: false,
        expected: 'A: 1260 pix²',
      },
      {
        displayUncertainties: true,
        hasPixelSpacing: false,
        expected: 'A: 1260 pix² +/- 180 pix²',
      },
    ])(
      'should render the right text when %o',
      ({ displayUncertainties, expected, hasPixelSpacing }) => {
        const result = formatArea(
          area,
          hasPixelSpacing,
          uncertainty,
          displayUncertainties
        );

        expect(result).toEqual(expected);
      }
    );
  });

  describe('formatDiameter', () => {
    const diameter = '125,7';
    const uncertainty = '2';

    it.each([
      {
        hasPixelSpacing: true,
        displayUncertainties: false,
        expected: 'd: 125,7 mm',
      },
      {
        displayUncertainties: true,
        hasPixelSpacing: true,
        expected: 'd: 125,7 mm +/- 2 mm',
      },
      {
        hasPixelSpacing: false,
        displayUncertainties: false,
        expected: 'd: 125,7 pix',
      },
      {
        displayUncertainties: true,
        hasPixelSpacing: false,
        expected: 'd: 125,7 pix +/- 2 pix',
      },
    ])(
      'should render the right text when %o',
      ({ displayUncertainties, expected, hasPixelSpacing }) => {
        const result = formatDiameter(
          diameter,
          hasPixelSpacing,
          uncertainty,
          displayUncertainties
        );

        expect(result).toEqual(expected);
      }
    );
  });
});
