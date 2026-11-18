# Presupuestador · contexto para Claude

App web para armar presupuestos de la sanitaria del suegro de Rodrigo (Uruguay). También es proyecto fuerte de portfolio/CV.

## Usuario
- El dueño no sabe usar la PC; hoy presupuesta en papel y pasa a Word. Se jubila en un par de años y queda un empleado: la app también le enseña la parte administrativa.
- Todo tiene que ser grande, claro y en castellano rioplatense ("tocá", "escribí").

## Cómo trabajamos (reglas)
- De a un paso por vez. Al terminar un paso: lint + tests + build, commit chico y decir cuál es el próximo paso.
- Respuestas cortas, optimizar tokens, no repetir contexto.
- Límite: versión 1 en 3–4 semanas sin robarle horas al estudio (exámenes en diciembre).
- Rodrigo prefiere instrucciones de UN solo paso concreto cuando tiene que hacer algo él.

## Stack
React + TypeScript (Vite) · Supabase (base + login, RLS por empresa) · Vitest · oxlint · GitHub Pages (deploy automático en push a main, base `/presupuestador/`).
Repo: github.com/Rodri1923/presupuestador. Migraciones en `supabase/migrations/`.

## Pantallas
1. Inicio: lista de presupuestos + botón grande "Nuevo presupuesto".
2. Armar presupuesto: pantalla dividida. Izquierda pasos (Cliente → Materiales → Mano de obra → Viáticos → Condiciones); derecha vista previa en vivo de la hoja tal cual el PDF. En celular: pestañas "Armar" y "Ver presupuesto".
3. Configuración (una vez): datos de la empresa, logo, tarifas, valores por defecto, lista de materiales. La primera vez va directo acá.

## Estado (18/11)
- Hecho: esqueleto, base Supabase, login/recuperar clave/primera vez, tests + deploy, pantalla Configuración (empresa, tarifas, viáticos, IVA, validez, condiciones).
- Próximo: lista de materiales dentro de Configuración.
- Después: Inicio real, Armar presupuesto + vista previa, PDF y Word en el navegador, demo pública con datos de ejemplo, README completo con capturas.
- Versión 2: nivel de detalle del PDF, historial con buscador.

## Decisiones de diseño (mandan sobre todo)
Prototipo de referencia: https://claude.ai/artifact/NgVfmiSUNA2wHZtJN1rHYF (Figma en pausa).

**Arranque:** datos de la empresa los carga el dueño; lista de materiales vacía (se arma sola al presupuestar); numeración desde N° 0001; sin logo → círculo con iniciales, se puede subir uno.

**Responsive:** 360 px a 1440 px, probar en 360, 768, 900, 1024, 1280, 1440; sin scroll horizontal ni cosas encimadas. Fila de material: arriba nombre y ×; abajo precio + unidad, cantidad (− +) e importe, que bajan de línea si no entran. Celular: sin subtítulo en la barra; pasos 1–5 en una línea sin rayitas. Hoja/PDF: números, unidad y precios nunca cortados en dos líneas.

**Precios:** cada presupuesto guarda sus precios; cambiar la lista no toca los ya hechos. Al cambiar un precio en un presupuesto aparece "¿Guardar este precio?" con **Para siempre** / **Solo este presupuesto**. Compu: se abre con Enter o al salir del campo; "Para siempre" marcado por defecto (Enter lo guarda con fecha de hoy); flecha → + Enter o clic para "Solo este". Celular: sin opción por defecto, botones grandes. Números con coma decimal (18,50) y punto de miles (1.500) — usar `leerNumero`/`formatearPesos` y `CampoNumero`.

**Unidades:** cada material tiene unidad (unidad, m, tira, rollo, bobina, kg, litro…, o escrita). El mismo material puede estar varias veces con distinta unidad y precio. En el presupuesto, cambiar la unidad toma el precio de esa unidad; si no existe pide el precio y pregunta si guardarlo. La hoja/PDF tiene columna "Unidad".

**Cantidades:** se escriben (con decimales) y además botones − y +.

**Mano de obra:** oficial, medio oficial, peón; cada uno "Por día" o "Por hora" (tarifas en Configuración). Viáticos: km totales × $/km y cantidad de comidas × $/comida.

**Presupuesto viejo:** sin botón "Actualizar". Si tiene precios distintos a los de hoy, franja arriba con "Ver precios de hoy": muestra antes → ahora y el total nuevo, pide confirmar y crea una copia nueva; el original queda igual.

**Lista de materiales:** cada material con fecha de última actualización (automática) y "Dónde se compra" (opcional). Si el precio tiene más de 3 meses: fecha en naranja y arriba "N materiales tienen el precio de hace más de 3 meses · Ver cuáles".
