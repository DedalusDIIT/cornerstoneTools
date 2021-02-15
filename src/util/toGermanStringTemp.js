/**
 * Temporary solution for german string formatting.
 * Should be replaced by proper localization.
 */
export default function(value) {
  if (!Number.isNaN(value)) {
    return formatNumber(value);
  }

  return formatString(value);
}

const numberFormatOptions = {};
function formatNumber(value) {
  return new Intl.NumberFormat('de-DE', numberFormatOptions).format(value);
}

function formatString(value) {}
