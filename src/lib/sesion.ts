import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Estado de la sesión:
 * - cargando: todavía no sabemos si hay alguien adentro
 * - recuperando: entró desde el link de "me olvidé la contraseña"
 */
export function useSesion() {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);
  const [recuperando, setRecuperando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      setSesion(s);
      if (evento === 'PASSWORD_RECOVERY') setRecuperando(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return { sesion, cargando, recuperando, terminarRecuperacion: () => setRecuperando(false) };
}

/** Empresa del usuario (o null si es la primera vez). */
export async function buscarEmpresaId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('miembros').select('empresa_id').eq('user_id', userId).limit(1).maybeSingle();
  if (error) throw error;
  return data?.empresa_id ?? null;
}
