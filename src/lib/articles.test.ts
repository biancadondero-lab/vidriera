import { describe, it, expect } from 'vitest';
import {
  filtrarPublicados,
  ordenarPorFechaDesc,
  filtrarPorCategoria,
  obtenerPublicadosOrdenados,
  separarPrimeros,
  ordenarPorFechaAsc,
  type Articulo,
} from './articles';

function crearArticulo(overrides: Partial<Articulo> = {}): Articulo {
  return {
    id: 'test-articulo',
    titulo: 'Título de prueba',
    categoria: 'campanas-actuales',
    fecha: new Date('2026-01-01'),
    resumen: 'Resumen de prueba',
    estado: 'publicado',
    ...overrides,
  };
}

describe('filtrarPublicados', () => {
  it('deja solo los artículos con estado publicado', () => {
    const articulos = [
      crearArticulo({ id: 'a', estado: 'publicado' }),
      crearArticulo({ id: 'b', estado: 'borrador' }),
    ];
    expect(filtrarPublicados(articulos).map((a) => a.id)).toEqual(['a']);
  });
});

describe('ordenarPorFechaDesc', () => {
  it('ordena del más nuevo al más viejo', () => {
    const articulos = [
      crearArticulo({ id: 'viejo', fecha: new Date('2026-01-01') }),
      crearArticulo({ id: 'nuevo', fecha: new Date('2026-06-01') }),
    ];
    expect(ordenarPorFechaDesc(articulos).map((a) => a.id)).toEqual(['nuevo', 'viejo']);
  });
});

describe('filtrarPorCategoria', () => {
  it('deja solo los artículos de la categoría pedida', () => {
    const articulos = [
      crearArticulo({ id: 'a', categoria: 'campanas-actuales' }),
      crearArticulo({ id: 'b', categoria: 'tendencias-y-datos' }),
    ];
    expect(filtrarPorCategoria(articulos, 'tendencias-y-datos').map((a) => a.id)).toEqual(['b']);
  });
});

describe('obtenerPublicadosOrdenados', () => {
  it('combina filtrado por publicado y orden por fecha', () => {
    const articulos = [
      crearArticulo({ id: 'borrador-nuevo', estado: 'borrador', fecha: new Date('2026-06-01') }),
      crearArticulo({ id: 'publicado-viejo', estado: 'publicado', fecha: new Date('2026-01-01') }),
      crearArticulo({ id: 'publicado-nuevo', estado: 'publicado', fecha: new Date('2026-05-01') }),
    ];
    expect(obtenerPublicadosOrdenados(articulos).map((a) => a.id)).toEqual([
      'publicado-nuevo',
      'publicado-viejo',
    ]);
  });
});

describe('separarPrimeros', () => {
  it('con lista vacía devuelve ambos arrays vacíos', () => {
    expect(separarPrimeros([], 3)).toEqual({ primeros: [], resto: [] });
  });

  it('con cantidad mayor a la lista, todo queda en primeros', () => {
    const articulos = [crearArticulo({ id: 'a' }), crearArticulo({ id: 'b' })];
    expect(separarPrimeros(articulos, 5)).toEqual({ primeros: articulos, resto: [] });
  });

  it('separa los primeros N manteniendo el orden, y el resto queda con el resto', () => {
    const articulos = [
      crearArticulo({ id: 'a' }),
      crearArticulo({ id: 'b' }),
      crearArticulo({ id: 'c' }),
      crearArticulo({ id: 'd' }),
    ];
    const resultado = separarPrimeros(articulos, 2);
    expect(resultado.primeros.map((a) => a.id)).toEqual(['a', 'b']);
    expect(resultado.resto.map((a) => a.id)).toEqual(['c', 'd']);
  });
});

describe('ordenarPorFechaAsc', () => {
  it('ordena del más viejo al más nuevo', () => {
    const articulos = [
      crearArticulo({ id: 'nuevo', fecha: new Date('2026-06-01') }),
      crearArticulo({ id: 'viejo', fecha: new Date('2026-01-01') }),
    ];
    expect(ordenarPorFechaAsc(articulos).map((a) => a.id)).toEqual(['viejo', 'nuevo']);
  });
});
