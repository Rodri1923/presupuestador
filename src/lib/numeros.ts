/**
 * Lee un número escrito a la uruguaya: miles con punto y decimales con coma.
 * "1.500" → 1500 · "18,50" → 18.5 · "1.500,75" → 1500.75
 * Devuelve null si el texto no es un número válido.
 */
export function leerNumero(texto: string): number | null {
  const t = texto.trim().replace(/\s/g, '');
  if (!/^-?(\d{1,3}(\.\d{3})+|\d+)(,\d+)?$/.test(t)) return null;
  return Number(t.replace(/\./g, '').replace(',', '.'));
}

/** Formatea un importe con miles con punto y 2 decimales con coma: 1500.5 → "1.500,50" */
export function formatearPesos(n: number): string {
  return n.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
