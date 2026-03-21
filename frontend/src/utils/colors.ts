/**
 * Map a MOER value to a color on the emerald-amber-crimson scale.
 * Low MOER (clean) = emerald, mid = amber, high (dirty) = crimson.
 */
export function moerToColor(moer: number): string {
  // Typical CAISO range: ~300 (very clean) to ~950 (very dirty)
  const min = 300;
  const max = 950;
  const t = Math.max(0, Math.min(1, (moer - min) / (max - min)));

  if (t < 0.4) {
    // Emerald to amber
    const p = t / 0.4;
    return interpolateColor("#10b981", "#f59e0b", p);
  } else {
    // Amber to crimson
    const p = (t - 0.4) / 0.6;
    return interpolateColor("#f59e0b", "#ef4444", p);
  }
}

function interpolateColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function moerToLabel(moer: number): "clean" | "moderate" | "dirty" {
  if (moer < 500) return "clean";
  if (moer < 700) return "moderate";
  return "dirty";
}

export function healthScoreToColor(score: number): string {
  // 0 = good (emerald), 1 = bad (crimson)
  if (score < 0.3) return "#10b981";
  if (score < 0.6) return "#f59e0b";
  return "#ef4444";
}
