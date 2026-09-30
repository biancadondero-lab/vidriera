export interface TitulosLectura {
  insight: string;
  palanca: string;
  pyme: string;
}

export function titulosLectura(categoria: string): TitulosLectura {
  if (categoria === 'fracasos-de-marca') {
    return {
      insight: 'El error',
      palanca: 'Lo que se ignoró',
      pyme: 'Cómo evitarlo en una PyME',
    };
  }
  return {
    insight: 'El insight',
    palanca: 'La palanca',
    pyme: 'Cómo lo aplicaría una PyME argentina',
  };
}
