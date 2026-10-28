/**
 * Script: check-contrast.cjs
 * Requirement W-A11Y:
 * Calculates relative luminance and WCAG 2.2 contrast ratios for primary UI color combinations.
 */

function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const colorPairs = [
  { name: 'Dark Slate text on White background', text: '#0f172a', bg: '#ffffff', min: 4.5 },
  { name: 'Slate-700 body on Slate-50 background', text: '#334155', bg: '#f8fafc', min: 4.5 },
  { name: 'Primary Emerald-700 on Emerald-50 background', text: '#047857', bg: '#ecfdf5', min: 4.5 },
  { name: 'White text on Primary Emerald-700 button', text: '#ffffff', bg: '#047857', min: 4.5 },
  { name: 'Reserve Rose-700 on Rose-50 background', text: '#be123c', bg: '#fff1f2', min: 4.5 },
  { name: 'White text on Reserve Rose-600 badge', text: '#ffffff', bg: '#e11d48', min: 4.5 }
];

console.log('========================================================');
console.log('WCAG 2.2 AA Contrast Ratio Audit');
console.log('========================================================');

let allPass = true;
for (const pair of colorPairs) {
  const ratio = getContrastRatio(pair.text, pair.bg);
  const passed = ratio >= pair.min;
  console.log(`${passed ? '✓ PASS' : '✗ FAIL'} [${ratio.toFixed(2)}:1] (Min ${pair.min}:1): ${pair.name}`);
  if (!passed) allPass = false;
}

console.log('========================================================');
if (allPass) {
  console.log('All core color pairings meet or exceed WCAG 2.2 AA guidelines.');
  process.exit(0);
} else {
  console.error('One or more color pairings failed WCAG 2.2 AA.');
  process.exit(1);
}
