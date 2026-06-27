function formatScaled(value: number, suffix: string): string {
  const scaled = Math.round(value * 10) / 10;
  if (Number.isInteger(scaled)) {
    return `${scaled}${suffix}`;
  }
  return `${scaled.toFixed(1)}${suffix}`;
}

export function formatCount(num: number): string {
  if (!Number.isFinite(num) || num < 0) return "0";

  const value = Math.floor(num);

  if (value < 1_000) return String(value);
  if (value < 1_000_000) return formatScaled(value / 1_000, "k");
  if (value < 1_000_000_000) return formatScaled(value / 1_000_000, "m");
  return formatScaled(value / 1_000_000_000, "b");
}
