// lib/svg.ts
// Checks an uploaded drawing before it's saved. SVG files can hide code, so anything
// that could run is refused.
const MAX_BYTES = 300_000; // 300 KB is plenty for a clothing layer

const DANGEROUS = [
  /<script/i, // scripts
  /\son[a-z]+\s*=/i, // onload=, onclick= …
  /javascript:/i,
  /<foreignObject/i, // can hold web pages
  /<iframe|<embed|<object/i,
  /(href|src)\s*=\s*["']\s*(https?:)?\/\//i, // loading things from other websites
];

export function checkSvg(text: string, label: string): string | null {
  if (text.length === 0) return null; // no new file: keep the old one
  if (text.length > MAX_BYTES) return `${label}: the file is bigger than 300 KB.`;
  if (!/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(text)) return `${label}: this isn't an SVG file. Export it from Figma as SVG.`;
  if (!/viewBox="0 0 600 1500"/.test(text)) return `${label}: the drawing must be 600 × 1500, like the Figma model frame.`;
  if (DANGEROUS.some((pattern) => pattern.test(text))) return `${label}: the file contains code, so it was refused.`;
  return null;
}