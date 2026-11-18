import { useEffect, useState, type FormEvent } from 'react';
import CampoNumero from '../componentes/CampoNumero';
import { cargarEmpresa, guardarEmpresa, type DatosEditables } from '../lib/empresa';
import { iniciales } from '../lib/iniciales';
import { mensajeDeError } from '../lib/errores';

type Numericos = {
  [K in keyof DatosEditables]: DatosEditables[K] extends number ? K : never
}[keyof DatosEditables];

/** Mientras se escribe, un número mal escrito queda en null hasta que se corrija. */
type Formulario = Omit<DatosEditables, Numericos> & { [K in Numericos]: number | null };

const CATEGORIAS = [
  { nombre: 'Oficial', dia: 'oficial_dia', hora: 'oficial_hora' },
  { nombre: 'Medio oficial', dia: 'medio_oficial_dia', hora: 'medio_oficial_hora' },
  { nombre: 'Peón', dia: 'peon_dia', hora: 'peon_hora' },
] as const;

const NUMERICOS: Numericos[] = [
  ...CATEGORIAS.flatMap((c) => [c.dia, c.hora]),
  'precio_km', 'precio_comida', 'iva_pct', 'validez_dias',
];

interface Props {
  empresaId: string;
  /** La primera vez el botón dice "Empezar" y no hay "Volver" */
  primeraVez: boolean;
  alTerminar: () => void;
}

export default function Configuracion({ empresaId, primeraVez, alTerminar }: Props) {
  const [form, setForm] = useState<Formulario>();
  const [errorCarga, setErrorCarga] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    cargarEmpresa(empresaId)
      .then(({ id: _id, logo_url: _logo, ...datos }) => setForm(datos))
      .catch((e) => setErrorCarga(mensajeDeError(e)));
  }, [empresaId]);

  if (errorCarga) return <main className="centrado"><div className="aviso error">{errorCarga}</div></main>;
  if (!form) return <main className="centrado"><p className="subtitulo">Cargando…</p></main>;

  const poner = <K extends keyof Formulario>(k: K, v: Formulario[K]) => {
    setForm({ ...form, [k]: v });
    setGuardado(false);
  };
  const texto = (k: 'nombre' | 'rut' | 'telefono' | 'email' | 'direccion' | 'condiciones') => ({
    id: k, value: form[k] ?? '',
    onChange: (e: { target: { value: string } }) => poner(k, e.target.value),
  });
  const numero = (k: Numericos) => ({ id: k, valor: form[k] ?? 0, alCambiar: (n: number | null) => poner(k, n) });

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError('');
    if (!form.nombre.trim()) return setError('Falta el nombre de la empresa.');
    if (NUMERICOS.some((k) => form[k] === null))
      return setError('Hay un número mal escrito (marcado en rojo). Corregilo y probá de nuevo.');

    if (!Number.isInteger(form.validez_dias)) return setError('La validez va en días enteros (ej.: 15).');
    if (NUMERICOS.some((k) => (form[k] ?? 0) < 0)) return setError('Los valores no pueden ser negativos.');

    setGuardando(true);
    try {
      await guardarEmpresa(empresaId, form as DatosEditables);
      if (primeraVez) alTerminar();
      else setGuardado(true);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="pagina">
      <header className="barra">
        {!primeraVez && <button type="button" className="volver" onClick={alTerminar}>← Volver</button>}
        <h1>Configuración</h1>
      </header>

      <form className="formulario" onSubmit={guardar} noValidate>
        {primeraVez && (
          <p className="subtitulo">
            Cargá esto una sola vez. Después se usa solo en cada presupuesto, y lo podés cambiar cuando quieras.
          </p>
        )}

        <section className="seccion">
          <h2>Tu empresa</h2>
          <div className="logo-fila">
            <div className="logo-circulo" aria-hidden="true">{iniciales(form.nombre)}</div>
            <p className="ayuda">Así sale el logo en el presupuesto. Más adelante vas a poder subir uno.</p>
          </div>
          <div className="campo">
            <label htmlFor="nombre">Nombre de la empresa</label>
            <input {...texto('nombre')} required />
          </div>
          <div className="grilla">
            <div className="campo">
              <label htmlFor="rut">RUT <span className="opcional">(opcional)</span></label>
              <input {...texto('rut')} inputMode="numeric" />
            </div>
            <div className="campo">
              <label htmlFor="telefono">Teléfono</label>
              <input {...texto('telefono')} type="tel" autoComplete="tel" />
            </div>
          </div>
          <div className="campo">
            <label htmlFor="email">Mail <span className="opcional">(opcional)</span></label>
            <input {...texto('email')} type="email" autoComplete="email" />
          </div>
          <div className="campo">
            <label htmlFor="direccion">Dirección <span className="opcional">(opcional)</span></label>
            <input {...texto('direccion')} autoComplete="street-address" />
          </div>
        </section>

        <section className="seccion">
          <h2>Mano de obra</h2>
          <p className="ayuda">Lo que cobrás por cada trabajador. En el presupuesto elegís si va por día o por hora.</p>
          {CATEGORIAS.map((c) => (
            <fieldset key={c.nombre} className="categoria">
              <legend>{c.nombre}</legend>
              <div className="grilla">
                <CampoNumero {...numero(c.dia)} etiqueta="Por día" prefijo="$" importe />
                <CampoNumero {...numero(c.hora)} etiqueta="Por hora" prefijo="$" importe />
              </div>
            </fieldset>
          ))}
        </section>

        <section className="seccion">
          <h2>Viáticos</h2>
          <div className="grilla">
            <CampoNumero {...numero('precio_km')} etiqueta="Por kilómetro" prefijo="$" importe />
            <CampoNumero {...numero('precio_comida')} etiqueta="Por comida" prefijo="$" importe />
          </div>
        </section>

        <section className="seccion">
          <h2>Para todos los presupuestos</h2>
          <p className="ayuda">Vienen así de entrada; en cada presupuesto se pueden cambiar.</p>
          <div className="grilla">
            <CampoNumero {...numero('iva_pct')} etiqueta="IVA" sufijo="%" />
            <CampoNumero {...numero('validez_dias')} etiqueta="Validez del presupuesto" sufijo="días" />
          </div>
          <div className="campo">
            <label htmlFor="condiciones">Condiciones <span className="opcional">(opcional)</span></label>
            <textarea {...texto('condiciones')} rows={4}
              placeholder="Ej.: 50% al comenzar la obra y 50% al terminar. Los materiales los compra la empresa." />
          </div>
        </section>

        <div className="pie-fijo">
          {error && <div className="aviso error" role="alert">{error}</div>}
          {guardado && <div className="aviso ok" role="status">Listo, quedó guardado.</div>}
          <button className="boton" disabled={guardando}>
            {guardando ? 'Guardando…' : primeraVez ? 'Guardar y empezar' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </main>
  );
}
