import { useState } from 'react';
import { formatearPesos, leerNumero } from '../lib/numeros';

interface Props {
  id: string;
  etiqueta: string;
  valor: number;
  alCambiar: (n: number | null) => void;
  /** Texto chico al costado del número: "$", "%", "días" */
  prefijo?: string;
  sufijo?: string;
  /** Si es importe se muestra con 2 decimales (1.500,00) */
  importe?: boolean;
}

const mostrar = (n: number, importe?: boolean) =>
  importe ? formatearPesos(n) : n.toLocaleString('es-UY', { maximumFractionDigits: 3 });

/** Campo numérico a la uruguaya: acepta "1.500" y "18,50", y al salir lo deja prolijo. */
export default function CampoNumero({ id, etiqueta, valor, alCambiar, prefijo, sufijo, importe }: Props) {
  const [texto, setTexto] = useState(() => mostrar(valor, importe));
  const invalido = texto.trim() !== '' && leerNumero(texto) === null;

  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <div className={'con-unidad' + (invalido ? ' invalido' : '')}>
        {prefijo && <span>{prefijo}</span>}
        <input id={id} inputMode="decimal" value={texto} aria-invalid={invalido}
          onChange={(e) => {
            setTexto(e.target.value);
            alCambiar(e.target.value.trim() === '' ? 0 : leerNumero(e.target.value));
          }}
          onBlur={() => {
            const n = texto.trim() === '' ? 0 : leerNumero(texto);
            if (n !== null) setTexto(mostrar(n, importe));
          }} />
        {sufijo && <span>{sufijo}</span>}
      </div>
      {invalido && <small className="error-campo">Escribilo así: 1.500 o 18,50</small>}
    </div>
  );
}
