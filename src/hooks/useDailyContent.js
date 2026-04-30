export function getDailyItem(list) {
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;

  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % list.length;
  return list[index];
}
