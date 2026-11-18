import { supabase } from './supabase';

/** Datos de la empresa que se cargan una vez en Configuración. */
export interface Empresa {
  id: string;
  nombre: string;
  rut: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  logo_url: string | null;
  oficial_dia: number;
  oficial_hora: number;
  medio_oficial_dia: number;
  medio_oficial_hora: number;
  peon_dia: number;
  peon_hora: number;
  precio_km: number;
  precio_comida: number;
  iva_pct: number;
  validez_dias: number;
  condiciones: string | null;
}

/** Campos que se editan desde Configuración (el resto no se toca acá). */
export type DatosEditables = Omit<Empresa, 'id' | 'logo_url'>;

const COLUMNAS =
  'id, nombre, rut, telefono, email, direccion, logo_url, oficial_dia, oficial_hora, ' +
  'medio_oficial_dia, medio_oficial_hora, peon_dia, peon_hora, precio_km, precio_comida, ' +
  'iva_pct, validez_dias, condiciones';

export async function cargarEmpresa(id: string): Promise<Empresa> {
  const { data, error } = await supabase.from('empresas').select(COLUMNAS).eq('id', id).single();
  if (error) throw error;
  // Postgres devuelve los numeric como texto: se pasan a número
  const e = data as unknown as Record<string, unknown>;
  const num = (k: string) => Number(e[k] ?? 0);
  return {
    ...(e as unknown as Empresa),
    oficial_dia: num('oficial_dia'), oficial_hora: num('oficial_hora'),
    medio_oficial_dia: num('medio_oficial_dia'), medio_oficial_hora: num('medio_oficial_hora'),
    peon_dia: num('peon_dia'), peon_hora: num('peon_hora'),
    precio_km: num('precio_km'), precio_comida: num('precio_comida'),
    iva_pct: num('iva_pct'), validez_dias: num('validez_dias'),
  };
}

export async function guardarEmpresa(id: string, datos: DatosEditables): Promise<void> {
  const limpio = (t: string | null) => (t?.trim() ? t.trim() : null);
  const { error } = await supabase.from('empresas').update({
    ...datos,
    nombre: datos.nombre.trim(),
    rut: limpio(datos.rut), telefono: limpio(datos.telefono), email: limpio(datos.email),
    direccion: limpio(datos.direccion), condiciones: limpio(datos.condiciones),
  }).eq('id', id);
  if (error) throw error;
}
