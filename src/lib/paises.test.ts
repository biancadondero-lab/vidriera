import { describe, it, expect } from 'vitest';
import { PAISES, nombrePais } from './paises';

describe('PAISES', () => {
  it('cada país tiene nombre y coordenadas dentro de rango válido', () => {
    Object.values(PAISES).forEach((pais) => {
      expect(pais.nombre.length).toBeGreaterThan(0);
      expect(pais.lat).toBeGreaterThanOrEqual(-90);
      expect(pais.lat).toBeLessThanOrEqual(90);
      expect(pais.lon).toBeGreaterThanOrEqual(-180);
      expect(pais.lon).toBeLessThanOrEqual(180);
    });
  });
});

describe('nombrePais', () => {
  it('devuelve el nombre para un slug conocido', () => {
    expect(nombrePais('estados-unidos')).toBe('Estados Unidos');
  });

  it('devuelve el slug tal cual si no lo encuentra', () => {
    expect(nombrePais('nunca-existio')).toBe('nunca-existio');
  });
});
