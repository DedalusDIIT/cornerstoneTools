import Decimal from 'decimal.js';

// Run node version with 14.18.3
/**
 * Custom measurement uncertainty rounding rules.
 * @param  {number} inputValue            measured value from annotation
 * @param  {number} uncertaintyValue      uncertainty from pixel diagonal
 */

/**
 * Rounding
 */

function getPixelDiagonal(colPixelSpacing, rowPixelSpacing) {
  if (colPixelSpacing !== undefined && colPixelSpacing !== null) {
    return new Decimal(colPixelSpacing ** 2 + rowPixelSpacing ** 2).sqrt();
  }

  return Decimal.sqrt(2);
}

function roundValueBasedOnUncertainty(inputValue, uncertaintyValue) {
  const valueToBeRounded = new Decimal(inputValue);
  const roundingRange = getRoundingRange(uncertaintyValue);

  return uncertaintyValue < 1
    ? valueToBeRounded.toFixed(roundingRange)
    : valueToBeRounded.toNearest(roundingRange);
}

function getThefirstSFIndex(uncertaintyValue) {
  return Decimal.ceil(-Decimal.log10(uncertaintyValue));
}

function getRoundingRange(uncertaintyValue) {
  if (uncertaintyValue < 1) {
    const firstSFIndex = getThefirstSFIndex(uncertaintyValue);
    const firstSignificantDigitValue = uncertaintyValue
      .toString()
      .charAt(firstSFIndex.plus(1));

    return firstSignificantDigitValue < 3
      ? parseInt(firstSFIndex.plus(1), 10)
      : parseInt(firstSFIndex, 10);
  }
  const uncertaintyGreaterThanOne = uncertaintyValue.toString().split('.')[0];
  const powerOf =
    uncertaintyGreaterThanOne[0] < 3
      ? uncertaintyGreaterThanOne.length - 2
      : uncertaintyGreaterThanOne.length - 1;

  return Decimal.pow(10, powerOf);
}

export {
  roundValueBasedOnUncertainty,
  getPixelDiagonal,
  getThefirstSFIndex,
  getRoundingRange,
};
