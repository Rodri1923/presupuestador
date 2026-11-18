import { supabase } from '../lib/supabase';

export default function Inicio({ abrirConfiguracion }: { abrirConfiguracion: () => void }) {
  return (
    <main className="centrado">
      <div className="tarjeta">
        <h1>Presupuestos</h1>
        <p className="subtitulo">Acá va a estar la lista y el botón "Nuevo presupuesto".</p>
        <button className="boton secundario" onClick={abrirConfiguracion}>Configuración</button>
        <button className="enlace" onClick={() => supabase.auth.signOut()}>Salir</button>
      </div>
    </main>
  );
}
