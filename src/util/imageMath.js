export function getSafeRatio(numerator, denominator) {
  if (!numerator || !denominator) {
    return 1;
  }

  const ratio = numerator / denominator;

  return Number.isFinite(ratio) ? ratio : 1;
}

export function getImageDimension(image, primaryKey, fallbackKey) {
  if (!image) {
    return undefined;
  }

  if (typeof image[primaryKey] === 'number') {
    return image[primaryKey];
  }

  if (fallbackKey && typeof image[fallbackKey] === 'number') {
    return image[fallbackKey];
  }

  return undefined;
}
