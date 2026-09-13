import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articulos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articulos' }),
  schema: z.object({
    titulo: z.string(),
    categoria: z.enum([
      'campanas-actuales',
      'tendencias-y-datos',
      'campanas-historicas',
      'redes-y-viralidad',
      'marketing-digital',
    ]),
    fecha: z.coerce.date(),
    resumen: z.string(),
    fuente: z.string().optional(),
    estado: z.enum(['borrador', 'publicado']),
    imagen: z.string().optional(),
  }),
});

export const collections = { articulos };
