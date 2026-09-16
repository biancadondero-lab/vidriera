export type CategoriaSlug =
  | 'campanas-actuales'
  | 'tendencias-y-datos'
  | 'campanas-historicas'
  | 'redes-y-viralidad'
  | 'marketing-digital'
  | 'fracasos-de-marca';

export const CATEGORIAS: { slug: CategoriaSlug; nombre: string; descripcion: string }[] = [
  {
    slug: 'campanas-actuales',
    nombre: 'Campañas actuales',
    descripcion: 'Campañas de marketing recientes que marcaron tendencia: qué hicieron las marcas y por qué funcionaron.',
  },
  {
    slug: 'tendencias-y-datos',
    nombre: 'Tendencias y datos',
    descripcion: 'Datos y estudios que explican hacia dónde va el marketing: IA, redes sociales, retail media y más.',
  },
  {
    slug: 'campanas-historicas',
    nombre: 'Campañas históricas',
    descripcion: 'Las campañas que escribieron la historia del marketing, de Volkswagen a De Beers.',
  },
  {
    slug: 'redes-y-viralidad',
    nombre: 'Redes y viralidad',
    descripcion: 'Cómo se vuelve viral una marca: los mecanismos detrás de los fenómenos de redes sociales.',
  },
  {
    slug: 'marketing-digital',
    nombre: 'Marketing digital',
    descripcion: 'Canales, automatización y comercio conversacional: cómo se vende hoy en el mundo digital.',
  },
  {
    slug: 'fracasos-de-marca',
    nombre: 'Fracasos de marca',
    descripcion: 'Las campañas y decisiones de marketing que salieron mal, y lo que enseñan sobre gestión de crisis.',
  },
];

export function nombreCategoria(slug: string): string {
  return CATEGORIAS.find((c) => c.slug === slug)?.nombre ?? slug;
}

export function descripcionCategoria(slug: string): string | undefined {
  return CATEGORIAS.find((c) => c.slug === slug)?.descripcion;
}
