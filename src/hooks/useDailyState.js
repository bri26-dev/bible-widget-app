export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}
