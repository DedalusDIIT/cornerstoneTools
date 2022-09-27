import Decimal from 'decimal.js';
import * as measurementUncertainty from './measurementUncertaintyTool';

describe('util: measurementUncertaintyTool.js', () => {
  it('returns pixelDiagnoal value calculated by avaiable pixelSpacing inputs', () => {
    const colPixelSpacing = 0.123;
    const rowPixelSpacing = 0.123;
    const pixelDiagonal = measurementUncertainty
      .getPixelDiagonal(colPixelSpacing, rowPixelSpacing)
      .toFixed(7);

    expect(pixelDiagonal).toEqual('0.1739483');
  });

  it('returns pixelDiagnoal value calculated with squre root of two with undefined pixelSpacing values', () => {
    const colPixelSpacing = undefined;
    const rowPixelSpacing = undefined;
    const pixelDiagonal = measurementUncertainty
      .getPixelDiagonal(colPixelSpacing, rowPixelSpacing)
      .toFixed(7);

    expect(pixelDiagonal).toEqual('1.4142136');
  });

  it('returns pixelDiagnoal value calculated with squre root of two with missing pixelSpacing values', () => {
    const colPixelSpacing = null;
    const rowPixelSpacing = null;
    const pixelDiagonal = measurementUncertainty
      .getPixelDiagonal(colPixelSpacing, rowPixelSpacing)
      .toFixed(7);

    expect(pixelDiagonal).toEqual('1.4142136');
  });

  it('returns rounded value of input based on uncertainty', () => {
    const inputValue = 291.9878225987628;
    const uncertainty = 0.02595339539885377778;
    const roundedValue = measurementUncertainty.roundValueBasedOnUncertainty(
      inputValue,
      uncertainty
    );

    expect(roundedValue).toEqual('291.988');
  });

  it('returns rounded value of input based on uncertainty', () => {
    const inputValue = 291.9878225987628;
    const uncertainty = 11.32595339539885377778;
    const roundedValue = measurementUncertainty.roundValueBasedOnUncertainty(
      inputValue,
      uncertainty
    );

    expect(roundedValue).toEqual(new Decimal(292));
  });

  it('returns the index of a first significant figure', () => {
    const uncertainty = 0.32595339539885377778;
    const firstSFIndex = measurementUncertainty.getThefirstSFIndex(uncertainty);

    expect(firstSFIndex).toEqual(new Decimal(1));
  });

  it('returns the index of a first significant figure', () => {
    const uncertainty = 0.00595339539885377778;
    const firstSFIndex = measurementUncertainty.getThefirstSFIndex(uncertainty);

    expect(firstSFIndex).toEqual(new Decimal(3));
  });

  it('returns a rounding range when uncertainty below 1 and fisrt significant number is 1 or 2', () => {
    const uncertainty = 0.02595339539885377778;
    const decimalRoundingRange = measurementUncertainty.getRoundingRange(
      uncertainty
    );

    expect(decimalRoundingRange).toEqual(3);
  });

  it('returns a rounding range when uncertainty below 1 and fisrt significant number greater than 2', () => {
    const uncertainty = 0.595339539885377778;
    const decimalRoundingRange = measurementUncertainty.getRoundingRange(
      uncertainty
    );

    expect(decimalRoundingRange).toEqual(1);
  });

  it('returns a rounding range when uncertainty above 1 and fisrt significant number is 1 or 2', () => {
    const uncertainty = 150.0595339539885377778;
    const decimalRoundingRange = measurementUncertainty.getRoundingRange(
      uncertainty
    );

    expect(decimalRoundingRange).toEqual(new Decimal(10));
  });

  it('returns a rounding range when uncertainty above 1 and fisrt significant number is greater than 2', () => {
    const uncertainty = 500.0595339539885377778;
    const decimalRoundingRange = measurementUncertainty.getRoundingRange(
      uncertainty
    );

    expect(decimalRoundingRange).toEqual(new Decimal(100));
  });
});
