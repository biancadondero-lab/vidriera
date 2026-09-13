import { describe, it, expect } from 'vitest';
import { formatearFecha } from './fechas';

describe('formatearFecha', () => {
  it('formatea una fecha sin corrimiento de zona horaria', () => {
    expect(formatearFecha(new Date('1988-07-01'))).toBe('1 de julio de 1988');
  });

  it('formatea correctamente el primer día del año', () => {
    expect(formatearFecha(new Date('2011-01-01'))).toBe('1 de enero de 2011');
  });
});
