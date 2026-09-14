export function claseBento(indice: number): string {
  if (indice === 0) return 'sm:col-span-2 sm:row-span-2';
  if (indice === 1 || indice === 2) return 'sm:row-span-2';
  return '';
}

export const CLASES_GRID_BENTO = 'grid grid-cols-1 gap-5 sm:grid-cols-3 sm:auto-rows-[minmax(180px,auto)]';
