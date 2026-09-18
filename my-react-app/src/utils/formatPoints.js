export function formatPoints(points) {
  if (points === undefined || points === null) return "0";
  return new Intl.NumberFormat('en-US').format(points);
}