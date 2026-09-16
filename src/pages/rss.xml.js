import rss from '@astrojs/rss';
import { obtenerArticulosPublicados } from '../lib/contenido';
import { nombreCategoria } from '../lib/categorias';

export async function GET(context) {
  const publicados = await obtenerArticulosPublicados();

  return rss({
    title: 'Vidriera',
    description: 'Una curaduría de campañas de marketing, casos históricos, fracasos de marca y tendencias.',
    site: context.site,
    items: publicados.map((articulo) => ({
      title: articulo.titulo,
      description: articulo.resumen,
      pubDate: articulo.fecha,
      link: `/articulo/${articulo.id}/`,
      categories: [nombreCategoria(articulo.categoria)],
    })),
  });
}
