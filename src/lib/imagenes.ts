export function esLogo(url?: string): boolean {
  if (!url) return false;
  const sinQuery = url.split('?')[0].toLowerCase();
  // Wikimedia sirve los SVG como thumbnail rasterizado con el sufijo
  // original conservado, ej. ".../Logo.svg.png" en vez de ".../Logo.png".
  if (/\.svg(\.[a-z0-9]+)?$/.test(sinQuery)) return true;
  // Logos publicados directamente como PNG, ej. ".../Liquid-Death-Logo.png".
  const archivo = sinQuery.split('/').pop() ?? '';
  return archivo.endsWith('.png') && archivo.includes('logo');
}
