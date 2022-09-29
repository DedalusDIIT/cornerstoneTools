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

function getIndexOfFirstSignificantDigit(uncertaintyValue) {
  return Decimal.ceil(-Decimal.log10(uncertaintyValue));
}

function getRoundingRange(uncertaintyValue) {
  if (uncertaintyValue < 1) {
    const indexOfFirstSignificantDigit = getIndexOfFirstSignificantDigit(
      uncertaintyValue
    );
    const firstSignificantDigit = uncertaintyValue
      .toString()
      .charAt(indexOfFirstSignificantDigit.plus(1));

    return firstSignificantDigit < 3
      ? parseInt(indexOfFirstSignificantDigit.plus(1), 10)
      : parseInt(indexOfFirstSignificantDigit, 10);
  }
  const uncertaintyWholePart = uncertaintyValue.toString().split('.')[0];
  const uncertaintyWholePartFirstDigit =
    uncertaintyWholePart[0] < 3
      ? uncertaintyWholePart.length - 2
      : uncertaintyWholePart.length - 1;

  return Decimal.pow(10, uncertaintyWholePartFirstDigit);
}

export {
  roundValueBasedOnUncertainty,
  getPixelDiagonal,
  getIndexOfFirstSignificantDigit,
  getRoundingRange,
};
