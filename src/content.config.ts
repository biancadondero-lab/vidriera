import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIAS, type CategoriaSlug } from './lib/categorias';

const SLUGS = CATEGORIAS.map((c) => c.slug) as [CategoriaSlug, ...CategoriaSlug[]];

const articulos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articulos' }),
  schema: z.object({
    titulo: z.string(),
    categoria: z.enum(SLUGS),
    fecha: z.coerce.date(),
    resumen: z.string(),
    fuente: z.string().optional(),
    estado: z.enum(['borrador', 'publicado']),
    imagen: z.string().optional(),
  }),
});

export const collections = { articulos };
