export function esLogo(url?: string): boolean {
  if (!url) return false;
  const sinQuery = url.split('?')[0].toLowerCase();
  return sinQuery.endsWith('.svg');
}
