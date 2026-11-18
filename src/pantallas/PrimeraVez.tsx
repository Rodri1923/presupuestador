import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { mensajeDeError } from '../lib/errores';

/** Primera vez: se crea la empresa y después sigue en Configuración. */
export default function PrimeraVez({ alCrear }: { alCrear: (empresaId: string) => void }) {
  const [nombre, setNombre] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function crear(e: FormEvent) {
    e.preventDefault();
    setError(''); setEnviando(true);
    const { data, error } = await supabase.rpc('crear_empresa', { p_nombre: nombre.trim() });
    setEnviando(false);
    if (error) setError(mensajeDeError(error));
    else alCrear(data as string);
  }

  return (
    <main className="centrado">
      <form className="tarjeta" onSubmit={crear}>
        <h1>¡Bienvenido!</h1>
        <p className="subtitulo">Antes de empezar, cargá los datos de tu empresa. Se hace una sola vez.</p>
        {error && <div className="aviso error" role="alert">{error}</div>}
        <div className="campo">
          <label htmlFor="nombre">Nombre de la empresa</label>
          <input id="nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej.: Sanitaria Pérez" />
        </div>
        <button className="boton" disabled={enviando}>{enviando ? 'Guardando…' : 'Seguir'}</button>
      </form>
    </main>
  );
}
