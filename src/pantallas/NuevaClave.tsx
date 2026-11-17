import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { mensajeDeError } from '../lib/errores';

export default function NuevaClave({ alTerminar }: { alTerminar: () => void }) {
  const [clave, setClave] = useState('');
  const [repetir, setRepetir] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (clave !== repetir) { setError('Las dos contraseñas no coinciden.'); return; }
    setError(''); setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password: clave });
    setEnviando(false);
    if (error) setError(mensajeDeError(error));
    else alTerminar();
  }

  return (
    <main className="centrado">
      <form className="tarjeta" onSubmit={guardar}>
        <h1>Contraseña nueva</h1>
        <p className="subtitulo">Elegí una contraseña de al menos 6 caracteres.</p>
        {error && <div className="aviso error" role="alert">{error}</div>}
        <div className="campo">
          <label htmlFor="clave">Contraseña nueva</label>
          <input id="clave" type="password" autoComplete="new-password" required minLength={6}
            value={clave} onChange={(e) => setClave(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="repetir">Repetila</label>
          <input id="repetir" type="password" autoComplete="new-password" required minLength={6}
            value={repetir} onChange={(e) => setRepetir(e.target.value)} />
        </div>
        <button className="boton" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
      </form>
    </main>
  );
}
