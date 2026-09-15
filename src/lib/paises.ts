export const PAISES: Record<string, { nombre: string; lat: number; lon: number }> = {
  'estados-unidos': { nombre: 'Estados Unidos', lat: 39.8, lon: -98.6 },
  alemania: { nombre: 'Alemania', lat: 51.2, lon: 10.4 },
  suecia: { nombre: 'Suecia', lat: 62.0, lon: 15.0 },
  india: { nombre: 'India', lat: 20.6, lon: 79.0 },
  sudafrica: { nombre: 'Sudáfrica', lat: -30.6, lon: 22.9 },
  'reino-unido': { nombre: 'Reino Unido', lat: 54.0, lon: -2.0 },
  argentina: { nombre: 'Argentina', lat: -38.4, lon: -63.6 },
  francia: { nombre: 'Francia', lat: 46.6, lon: 2.2 },
  canada: { nombre: 'Canadá', lat: 56.1, lon: -106.3 },
  australia: { nombre: 'Australia', lat: -25.3, lon: 133.8 },
  brasil: { nombre: 'Brasil', lat: -14.2, lon: -51.9 },
  estonia: { nombre: 'Estonia', lat: 58.6, lon: 25.0 },
  china: { nombre: 'China', lat: 35.9, lon: 104.2 },
  dinamarca: { nombre: 'Dinamarca', lat: 56.3, lon: 9.5 },
  singapur: { nombre: 'Singapur', lat: 1.35, lon: 103.8 },
};

export function nombrePais(slug: string): string {
  return PAISES[slug]?.nombre ?? slug;
}
