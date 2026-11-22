export function createDocumentNumber(prefix: string): string {
  const year = new Date().getFullYear();
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${year}-${stamp}${random}`;
}