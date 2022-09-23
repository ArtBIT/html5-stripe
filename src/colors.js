// Color utils for parsing and converting colors to and from [r,g,b,a] array
//
export const parse = (color) => {
  const type = typeof color;
  if (type === "string") {
    return parseColorString(color);
  } else if (Array.isArray(color)) {
    return color;
  } else if (type === "object") {
    const { r, g, b, a = 255 } = color;
    return [r, g, b, a];
  }
  throw new Error("Unknown color format", color);
};

export const parseColorString = (color) => {
  if (color.charAt(0) === "#") {
    return parseHexString(color);
  } else if (color.startsWith("rgb")) {
    return parseRgbaString(color);
  } else if (color.startsWith("hsl")) {
    return parseHslaString(color);
  } else {
    throw new Error("Unknown color string", color);
  }
};

export const parseHexString = (color) => {
  let r = 0,
    g = 0,
    b = 0,
    a = 255;

  switch (color.length) {
    case 4:
      r = "0x" + color[1] + color[1];
      g = "0x" + color[2] + color[2];
      b = "0x" + color[3] + color[3];
      a = 255;
      break;
    case 5:
      r = "0x" + color[1] + color[1];
      g = "0x" + color[2] + color[2];
      b = "0x" + color[3] + color[3];
      a = "0x" + color[4] + color[4];
      break;
    case 7:
      r = "0x" + color[1] + color[2];
      g = "0x" + color[3] + color[4];
      b = "0x" + color[5] + color[6];
      a = 255;
      break;
    case 9:
      r = "0x" + color[1] + color[2];
      g = "0x" + color[3] + color[4];
      b = "0x" + color[5] + color[6];
      a = "0x" + color[7] + color[8];
      break;
    default:
  }
  return [r, g, b, a].map((value) => parseInt(value, 16));
};

export const parseRgbaString = (color) => {
  const [r, g, b, a = 1] = color
    .replace(/ */g, "")
    .match(/^rgba?\((.*)\)/)[1]
    .split(",");
  return [r, g, b, a * 255].map((value) => parseInt(value, 10));
};

export const parseHslaString = (color) => {
  const [h, s, l, a = 255] = color
    .replace(/ */g, "")
    .replace("%", "")
    .match(/^hsla?\((.*)\)/)[1]
    .split(",")
    .map((value) => parseFloat(value, 10));

  return hsla2rgba([h, s, l, a]);
};

const lerp = (a, b, amount = 0.5) => a * (1 - amount) + b * amount;

export const mix = (col1, col2, amount = 0.5) => {
  let [r, g, b, a] = parse(col1);
  const cmyk1 = rgb2cmyk([r, g, b]);
  const alpha1 = a;
  [r, g, b, a] = parse(col2);
  const cmyk2 = rgb2cmyk([r, g, b]);
  const alpha2 = a;

  [r, g, b] = cmyk2rgb(
    cmyk1.map((value, index) => lerp(value, cmyk2[index], amount))
  );
  a = parseInt(lerp(alpha1, alpha2, amount), 10);
  return [r, g, b, a];
};

export const rgba2hsla = (col) => {
  let [r, g, b, a] = parse(col);
  r /= 255;
  g /= 255;
  b /= 255;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  const diff = max - min;
  const summ = max + min;
  var h,
    s,
    l = summ / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    s = l > 0.5 ? diff / (2 - summ) : diff / summ;
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
      default:
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100, a];
};

export const hsla2rgba = ([h, s, l, a = 255]) => {
  let c = ((1 - Math.abs((2 * l) / 100 - 1)) * s) / 100,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l / 100 - c / 2,
    r = 0,
    g = 0,
    b = 0;
  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b, a];
};

const rgb2cmyk = ([r, g, b]) => {
  let c = 1 - r / 255;
  let m = 1 - g / 255;
  let y = 1 - b / 255;
  let k = Math.min(c, m, y);
  c = (c - k) / (1 - k);
  m = (m - k) / (1 - k);
  y = (y - k) / (1 - k);
  return [c, m, y, k];
};

const cmyk2rgb = ([c, m, y, k]) => {
  let r = c * (1 - k) + k;
  let g = m * (1 - k) + k;
  let b = y * (1 - k) + k;
  r = (1 - r) * 255 + 0.5;
  g = (1 - g) * 255 + 0.5;
  b = (1 - b) * 255 + 0.5;
  return [r, g, b];
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const rgba = (color) => {
  const [r, g, b, a] = parse(color).map((value) => clamp(value, 0, 255));
  if (a === 255) {
    return `rgb(${r},${g},${b})`;
  }
  return `rgba(${r},${g},${b},${a / 255})`;
};

export default parse;
