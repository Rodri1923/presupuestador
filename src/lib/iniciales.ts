const CONECTORES = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'el']);

/**
 * Iniciales para el círculo del logo (máx. 2 letras), salteando "de", "la", etc.
 * "Sanitaria Pérez" → "SP" · "Pérez" → "PE" · "Sanitaria de la Costa" → "SC"
 */
export function iniciales(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter((p) => p && !CONECTORES.has(p.toLowerCase()));
  if (palabras.length === 0) return '?';
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase();
}
