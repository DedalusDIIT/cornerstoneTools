/**
 * Temporary solution for german string formatting.
 * Should be replaced by proper localization.
 */

const numberFormatOptions = {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
};

export default function(value) {
  //var result = value.toLocaleString('de-DE') + 'xcv';
  //const result = isNaN(value);

  // replace comma
  //result = result.replace('.', ' ');
  const result = value
    .toFixed(2) // always two decimal digits
    .replace('.', ',') // replace decimal point character with ,
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');

  return result;
}
