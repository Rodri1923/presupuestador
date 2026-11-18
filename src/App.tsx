import { useEffect, useState } from 'react';
import { useSesion, buscarEmpresaId } from './lib/sesion';
import { mensajeDeError } from './lib/errores';
import Login from './pantallas/Login';
import NuevaClave from './pantallas/NuevaClave';
import PrimeraVez from './pantallas/PrimeraVez';
import Configuracion from './pantallas/Configuracion';
import Inicio from './pantallas/Inicio';

function Cargando() {
  return <main className="centrado"><p className="subtitulo">Cargando…</p></main>;
}

type Pantalla = 'inicio' | 'configuracion' | 'configuracion-primera-vez';

export default function App() {
  const { sesion, cargando, recuperando, terminarRecuperacion } = useSesion();
  // Resultado de buscar la empresa, atado al usuario al que pertenece
  const [busqueda, setBusqueda] = useState<{ userId: string; empresaId: string | null; error?: string }>();
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const userId = sesion?.user.id;

  useEffect(() => {
    if (!userId) return;
    buscarEmpresaId(userId)
      .then((empresaId) => setBusqueda({ userId, empresaId }))
      .catch((e) => setBusqueda({ userId, empresaId: null, error: mensajeDeError(e) }));
  }, [userId]);

  // undefined = todavía buscando · null = no tiene empresa (primera vez)
  const actual = busqueda?.userId === userId ? busqueda : undefined;
  const empresaId = actual?.empresaId;
  const error = actual?.error;
  const crearEmpresa = (id: string) => {
    if (!userId) return;
    setBusqueda({ userId, empresaId: id });
    setPantalla('configuracion-primera-vez'); // la primera vez va directo a Configuración
  };

  if (cargando) return <Cargando />;
  if (recuperando) return <NuevaClave alTerminar={terminarRecuperacion} />;
  if (!sesion) return <Login />;
  if (error) return <main className="centrado"><div className="aviso error">{error}</div></main>;
  if (!actual) return <Cargando />;
  if (!empresaId) return <PrimeraVez alCrear={crearEmpresa} />;
  if (pantalla !== 'inicio')
    return <Configuracion empresaId={empresaId} primeraVez={pantalla === 'configuracion-primera-vez'}
      alTerminar={() => setPantalla('inicio')} />;
  return <Inicio abrirConfiguracion={() => setPantalla('configuracion')} />;
}
