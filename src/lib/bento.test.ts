import { describe, it, expect } from 'vitest';
import { claseBento } from './bento';

describe('claseBento', () => {
  it('el primer artículo ocupa el bloque grande', () => {
    expect(claseBento(0)).toBe('sm:col-span-2 sm:row-span-2');
  });

  it('el segundo y tercer artículo ocupan bloques medianos', () => {
    expect(claseBento(1)).toBe('sm:row-span-2');
    expect(claseBento(2)).toBe('sm:row-span-2');
  });

  it('el resto ocupa bloques chicos sin clases extra', () => {
    expect(claseBento(3)).toBe('');
    expect(claseBento(10)).toBe('');
  });
});
