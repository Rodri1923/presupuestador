import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { mensajeDeError } from '../lib/errores';

export default function Login() {
  const [modo, setModo] = useState<'entrar' | 'olvide'>('entrar');
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setError(''); setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: clave });
    if (error) setError(mensajeDeError(error));
    setEnviando(false);
  }

  async function pedirLink(e: FormEvent) {
    e.preventDefault();
    setError(''); setOk(''); setEnviando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + window.location.pathname,
    });
    if (error) setError(mensajeDeError(error));
    else setOk('Listo. Si el mail está registrado, te llega un link para crear una contraseña nueva.');
    setEnviando(false);
  }

  const olvide = modo === 'olvide';
  return (
    <main className="centrado">
      <form className="tarjeta" onSubmit={olvide ? pedirLink : entrar}>
        <h1>{olvide ? 'Recuperar contraseña' : 'Presupuestador'}</h1>
        <p className="subtitulo">
          {olvide ? 'Escribí tu mail y te mandamos un link.' : 'Entrá con tu mail y contraseña.'}
        </p>
        {error && <div className="aviso error" role="alert">{error}</div>}
        {ok && <div className="aviso ok" role="status">{ok}</div>}

        <div className="campo">
          <label htmlFor="email">Mail</label>
          <input id="email" type="email" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {!olvide && (
          <div className="campo">
            <label htmlFor="clave">Contraseña</label>
            <input id="clave" type="password" autoComplete="current-password" required
              value={clave} onChange={(e) => setClave(e.target.value)} />
          </div>
        )}

        <button className="boton" disabled={enviando}>
          {enviando ? 'Un momento…' : olvide ? 'Mandar link' : 'Entrar'}
        </button>
        <button type="button" className="enlace"
          onClick={() => { setModo(olvide ? 'entrar' : 'olvide'); setError(''); setOk(''); }}>
          {olvide ? 'Volver a entrar' : 'Me olvidé la contraseña'}
        </button>
      </form>
    </main>
  );
}
