export type Articulo = {
  id: string;
  titulo: string;
  categoria: string;
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

export function filtrarPorCategoria(articulos: Articulo[], categoria: string): Articulo[] {
  return articulos.filter((a) => a.categoria === categoria);
}

export function obtenerPublicadosOrdenados(articulos: Articulo[]): Articulo[] {
  return ordenarPorFechaDesc(filtrarPublicados(articulos));
}
