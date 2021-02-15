/**
 * Temporary solution for german string formatting.
 * Should be replaced by proper localization.
 */

const numberFormatOptions = {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
};

export default function(value) {
  var result = new Intl.NumberFormat('de-DE', numberFormatOptions).format(
    value
  );
  result = result.replace('.', ' ');

  return result;
}
