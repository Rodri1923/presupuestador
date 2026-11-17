/** Traduce los errores de Supabase a mensajes claros en castellano. */
export function mensajeDeError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error ?? '');
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'El mail o la contraseña no son correctos.';
  if (m.includes('email not confirmed')) return 'Falta confirmar el mail. Revisá tu correo.';
  if (m.includes('password should be at least')) return 'La contraseña tiene que tener al menos 6 caracteres.';
  if (m.includes('same password') || m.includes('should be different'))
    return 'La contraseña nueva tiene que ser distinta de la anterior.';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Hubo demasiados intentos. Esperá unos minutos y probá de nuevo.';
  if (m.includes('failed to fetch') || m.includes('network'))
    return 'No hay conexión a internet. Revisá la conexión y probá de nuevo.';
  return 'Algo salió mal. Probá de nuevo en un momento.';
}
