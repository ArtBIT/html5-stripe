// Some random helpers
export const pickRandomElement = (arr) =>
  arr[Math.floor(arr.length * Math.random())];
export const around = (value, sigma) =>
  value + (Math.random() - 0.5) * 2 * sigma;
export const randomRange = (min, max) => min + Math.random() * (max - min);
