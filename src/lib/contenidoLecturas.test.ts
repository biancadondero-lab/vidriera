import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'src/content/articulos');

describe('La lectura de Bianca en el contenido', () => {
  it('todo artículo publicado tiene su lectura', () => {
    const sinLectura = readdirSync(DIR)
      .filter((archivo) => archivo.endsWith('.md'))
      .filter((archivo) => {
        const texto = readFileSync(join(DIR, archivo), 'utf8');
        return /^estado: publicado$/m.test(texto) && !/^lecturaBianca:$/m.test(texto);
      });
    expect(sinLectura).toEqual([]);
  });
});
