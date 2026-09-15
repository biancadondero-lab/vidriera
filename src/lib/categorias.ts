export type CategoriaSlug =
  | 'campanas-actuales'
  | 'tendencias-y-datos'
  | 'campanas-historicas'
  | 'redes-y-viralidad'
  | 'marketing-digital'
  | 'fracasos-de-marca';

export const CATEGORIAS: { slug: CategoriaSlug; nombre: string }[] = [
  { slug: 'campanas-actuales', nombre: 'Campañas actuales' },
  { slug: 'tendencias-y-datos', nombre: 'Tendencias y datos' },
  { slug: 'campanas-historicas', nombre: 'Campañas históricas' },
  { slug: 'redes-y-viralidad', nombre: 'Redes y viralidad' },
  { slug: 'marketing-digital', nombre: 'Marketing digital' },
  { slug: 'fracasos-de-marca', nombre: 'Fracasos de marca' },
];

export function nombreCategoria(slug: string): string {
  return CATEGORIAS.find((c) => c.slug === slug)?.nombre ?? slug;
}
