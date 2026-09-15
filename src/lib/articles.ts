import type { CategoriaSlug } from './categorias';

export type Articulo = {
  id: string;
  titulo: string;
  categoria: CategoriaSlug;
  fecha: Date;
  resumen: string;
  fuente?: string;
  estado: 'borrador' | 'publicado';
  imagen?: string;
};

export function filtrarPublicados(articulos: Articulo[]): Articulo[] {
  return articulos.filter((a) => a.estado === 'publicado');
}

export function ordenarPorFechaDesc(articulos: Articulo[]): Articulo[] {
  return [...articulos].sort((a, b) => b.fecha.valueOf() - a.fecha.valueOf());
}

export function filtrarPorCategoria(articulos: Articulo[], categoria: CategoriaSlug): Articulo[] {
  return articulos.filter((a) => a.categoria === categoria);
}

export function obtenerPublicadosOrdenados(articulos: Articulo[]): Articulo[] {
  return ordenarPorFechaDesc(filtrarPublicados(articulos));
}

export function separarDestacadoPrincipal(
  articulos: Articulo[],
): { destacado: Articulo | null; resto: Articulo[] } {
  if (articulos.length === 0) return { destacado: null, resto: [] };
  const [destacado, ...resto] = articulos;
  return { destacado, resto };
}

export function separarPrimeros(
  articulos: Articulo[],
  cantidad: number,
): { primeros: Articulo[]; resto: Articulo[] } {
  return { primeros: articulos.slice(0, cantidad), resto: articulos.slice(cantidad) };
}

export function ordenarPorFechaAsc(articulos: Articulo[]): Articulo[] {
  return [...articulos].sort((a, b) => a.fecha.valueOf() - b.fecha.valueOf());
}
