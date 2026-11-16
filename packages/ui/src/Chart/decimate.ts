export interface IndexedPoint {
  readonly index: number;
  readonly value: number;
}

export const decimateLTTB = (
  points: readonly IndexedPoint[],
  target: number,
): readonly IndexedPoint[] => {
  if (points.length <= target || target < 3) return points;
  const first = points[0] as IndexedPoint;
  const last = points[points.length - 1] as IndexedPoint;
  const bucket = (points.length - 2) / (target - 2);
  const result: IndexedPoint[] = [first];
  let a = first;
  for (let i = 0; i < target - 2; i++) {
    const start = Math.floor(i * bucket) + 1;
    const end = Math.min(points.length - 1, Math.floor((i + 1) * bucket) + 1);
    const nextEnd = Math.min(points.length, Math.floor((i + 2) * bucket) + 1);
    let avgX = 0;
    let avgY = 0;
    let n = 0;
    for (let k = end; k < nextEnd; k++) {
      const p = points[k] as IndexedPoint;
      avgX += p.index;
      avgY += p.value;
      n++;
    }
    avgX /= n || 1;
    avgY /= n || 1;
    let maxArea = -1;
    let chosen = points[start] as IndexedPoint;
    for (let k = start; k < end; k++) {
      const p = points[k] as IndexedPoint;
      const area = Math.abs(
        (a.index - avgX) * (p.value - a.value) -
          (a.index - p.index) * (avgY - a.value),
      );
      if (area > maxArea) {
        maxArea = area;
        chosen = p;
      }
    }
    result.push(chosen);
    a = chosen;
  }
  result.push(last);
  return result;
};
