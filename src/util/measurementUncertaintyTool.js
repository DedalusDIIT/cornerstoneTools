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

function roundValue(inputValue, uncertaintyValue) {
  const value = new Decimal(inputValue);
  let i = 0;

  // Check if uncertainty is smaller than 1

  if (uncertaintyValue < 1) {
    const belowOne = uncertaintyValue.toString().split('.')[1];
    /**
      Uncertainty rounding measurement rule
      regarding first significant figure:
      if the first significant figure is greater than 2,
      rounding digit stays in the same index.
      However if it is 1 or 2, add one more 0 in the decimal.
      **/

    for (i = 0; i <= belowOne.length; i++) {
      if (belowOne[i] === '0') {
        continue;
      } else if (belowOne[i] === '1' || belowOne[i] === '2') {
        const powerOf = new Decimal(-(i + 2)).abs();
        const decimalPlace = parseInt(powerOf);
        const roundedValue = value.toFixed(decimalPlace);

        return [roundedValue, powerOf]; // PowerOf is used to fix the digit
      } else {
        const powerOf = new Decimal(-(i + 1)).abs();
        const decimalPlace = parseInt(powerOf);
        const roundedValue = value.toFixed(decimalPlace);

        return [roundedValue, powerOf];
      }
    }
  } else {
    // When the value is larger than 1
    const aboveOne = uncertaintyValue.toString().split('.')[0];

    if (aboveOne[0] === '1' || aboveOne[0] === '2') {
      const powerOf = aboveOne.length - 2;
      const roundingRange = Decimal.pow(10, powerOf);
      const roundedValue = new Decimal(value).toNearest(roundingRange);

      return [roundedValue, Decimal.abs(powerOf)];
    }
    const powerOf = aboveOne.length - 1;
    const roundingRange = Decimal.pow(10, powerOf);
    const roundedValue = new Decimal(value).toNearest(roundingRange);

    return [roundedValue, Decimal.abs(powerOf)];
  }
}

export { roundValue };
