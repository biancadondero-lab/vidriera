import { describe, it, expect } from 'vitest';
import { titulosLectura } from './lecturaBianca';

describe('titulosLectura', () => {
  it('usa los títulos de análisis para una campaña', () => {
    expect(titulosLectura('campanas-actuales')).toEqual({
      insight: 'El insight',
      palanca: 'La palanca',
      pyme: 'Cómo lo aplicaría una PyME argentina',
    });
  });

  it('usa los títulos de error para los fracasos de marca', () => {
    expect(titulosLectura('fracasos-de-marca')).toEqual({
      insight: 'El error',
      palanca: 'Lo que se ignoró',
      pyme: 'Cómo evitarlo en una PyME',
    });
  });
});
