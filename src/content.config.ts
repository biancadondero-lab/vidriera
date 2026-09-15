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
    citaDestacada: z.string().optional(),
    enNumeros: z.array(z.object({ etiqueta: z.string(), valor: z.string() })).optional(),
    nivelViral: z.number().min(0).max(100).optional(),
    viralidadEtiqueta: z.string().optional(),
    antesDespues: z.object({ antes: z.string(), despues: z.string() }).optional(),
    pais: z.string().optional(),
    desafio: z
      .object({
        pregunta: z.string(),
        opciones: z.array(z.string()).min(2).max(4),
        correctaIndice: z.number().int().min(0),
        revelacion: z.string(),
      })
      .optional(),
  }),
});

export const collections = { articulos };
