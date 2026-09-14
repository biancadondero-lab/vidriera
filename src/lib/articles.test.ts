import { describe, it, expect } from 'vitest';
import {
  filtrarPublicados,
  ordenarPorFechaDesc,
  filtrarPorCategoria,
  obtenerPublicadosOrdenados,
  separarDestacadoPrincipal,
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

describe('separarDestacadoPrincipal', () => {
  it('devuelve destacado null y resto vacío para lista vacía', () => {
    expect(separarDestacadoPrincipal([])).toEqual({ destacado: null, resto: [] });
  });

  it('con un solo artículo, ese es el destacado y el resto queda vacío', () => {
    const unico = crearArticulo({ id: 'unico' });
    expect(separarDestacadoPrincipal([unico])).toEqual({ destacado: unico, resto: [] });
  });

  it('con varios, el primero es el destacado y el resto mantiene el orden', () => {
    const articulos = [
      crearArticulo({ id: 'primero' }),
      crearArticulo({ id: 'segundo' }),
      crearArticulo({ id: 'tercero' }),
    ];
    const resultado = separarDestacadoPrincipal(articulos);
    expect(resultado.destacado?.id).toBe('primero');
    expect(resultado.resto.map((a) => a.id)).toEqual(['segundo', 'tercero']);
  });
});
