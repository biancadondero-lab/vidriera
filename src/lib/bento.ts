export function claseBento(indice: number): string {
  if (indice === 0) return 'sm:col-span-2 sm:row-span-2';
  if (indice === 1 || indice === 2) return 'sm:row-span-2';
  return '';
}
