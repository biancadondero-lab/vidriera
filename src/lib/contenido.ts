import { getCollection } from 'astro:content';
import { obtenerPublicadosOrdenados, type Articulo } from './articles';

export async function obtenerArticulosPublicados(): Promise<Articulo[]> {
  const entradas = await getCollection('articulos');
  const articulos: Articulo[] = entradas.map((e) => ({ id: e.id, ...e.data }));
  return obtenerPublicadosOrdenados(articulos);
}
