import { describe, it, expect } from 'vitest';
import { esLogo } from './imagenes';

describe('esLogo', () => {
  it('sin url devuelve false', () => {
    expect(esLogo(undefined)).toBe(false);
  });

  it('una url .svg es logo', () => {
    expect(esLogo('https://upload.wikimedia.org/wikipedia/commons/x/xx/Logo.svg')).toBe(true);
  });

  it('una url .svg con mayúsculas también es logo', () => {
    expect(esLogo('https://example.com/logo.SVG')).toBe(true);
  });

  it('una url .svg con query string sigue siendo logo', () => {
    expect(esLogo('https://example.com/logo.svg?width=200')).toBe(true);
  });

  it('una url .jpg no es logo', () => {
    expect(esLogo('https://images.unsplash.com/photo-123.jpg')).toBe(false);
  });

  it('una url de Unsplash sin extensión no es logo', () => {
    expect(esLogo('https://images.unsplash.com/photo-1683117927786-f146451082fb')).toBe(false);
  });
});
