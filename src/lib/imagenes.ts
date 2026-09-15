export function esLogo(url?: string): boolean {
  if (!url) return false;
  const sinQuery = url.split('?')[0].toLowerCase();
  // Wikimedia sirve los SVG como thumbnail rasterizado con el sufijo
  // original conservado, ej. ".../Logo.svg.png" en vez de ".../Logo.png".
  return /\.svg(\.[a-z0-9]+)?$/.test(sinQuery);
}
