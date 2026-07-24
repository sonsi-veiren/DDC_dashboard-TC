# Dashboard Tesorería FX — Brief v2 (GitHub + Vercel, sin base de datos)

## Cambio de arquitectura respecto de la v1
La versión anterior usaba Railway + Postgres + Prisma. Esta versión es más simple:
**no hay base de datos**. Los datos de operaciones viven en un archivo Excel
dentro del propio repositorio de GitHub. La app lo lee y calcula todo al vuelo.
Para actualizar datos, se reemplaza ese archivo en GitHub (subida manual o vía
Git) y Vercel redeploya automáticamente — no hay que correr scripts ni tocar
ninguna base de datos.

## Objetivo
Dashboard de operaciones de tesorería (cambio UYU/USD) para CELTRAY
RESIDENCIAL, publicado en Vercel, leyendo los datos desde
`/data/20260724_TC_CELTRAY.xlsx` dentro del repo.

## Stack
- Next.js (React) + Tailwind + Recharts
- API route de Next.js que lee el Excel del repo con la librería `xlsx`
  (SheetJS) en el servidor (`fs.readFileSync` + `XLSX.read`), NO en el cliente
- Sin base de datos, sin Prisma, sin backend separado
- Deploy: Vercel, conectado al repo de GitHub (deploy automático en cada push)

## Datos de entrada — IMPORTANTE: formato real del archivo de origen
El archivo real que el cliente va a subir/reemplazar (`20260724_TC_CELTRAY.xlsx`,
adjunto como referencia) **no es un CSV limpio** — es la planilla de trabajo real
de tesorería, con una sola hoja llamada **"Efecto TC"** que tiene:
- Filas 1-4 (Excel): celdas de resumen sueltas (Tipo de Cambio Proyectado = 42,
  TC Ponderado calculado, Resultado Actual, Proyectado, Total) — **no usar estos
  valores directamente, son de referencia**; la app debe recalcularlos.
- Fila 5 (Excel): headers de la tabla de operaciones, en las columnas D a I:
  `Fecha | Importe U$S | Importe $ | Tipo de cambio | Efecto Tipo de Cambio | Acumulado`
- Fila 6 en adelante: una fila por operación real.
- **A la derecha de la columna I hay columnas auxiliares sin relación** (una
  tabla de "Búsqueda"/"Cambio" con totales de otro sistema, y una matriz pivot
  de meses/años) — **ignorar todo lo que esté a la derecha de la columna I**.
- Más abajo en la misma columna D pueden aparecer etiquetas de texto sueltas
  (ej. "Ponderado", "TC ponderado a la fecha") en filas muy alejadas (ej. fila
  1002+) — **no son operaciones**, hay que parsear solo mientras la celda de
  "Fecha" sea una fecha válida y esté dentro del bloque contiguo de datos.

**Lógica de parseo recomendada**: leer la hoja "Efecto TC", tomar las columnas
D, E, F (Fecha, Importe U$S, Importe $) empezando en la fila 6, y cortar en la
primera fila donde la columna D deje de ser una fecha válida o esté vacía.
Ignorar las columnas G, H, I del archivo (Tipo de cambio, Efecto, Acumulado)
y **recalcularlas en la app** con las fórmulas de abajo — así es robusto a
qué tan prolija venga la planilla cada vez que se reemplace.

**Deduplicar** filas exactamente iguales (misma Fecha + Importe U$S + Importe $)
antes de sumar — el archivo real puede traer duplicados de carga.

Esta lógica de parseo (no un CSV de 4 columnas simple) es la que hay que
implementar en el API route que lee `/data/20260724_TC_CELTRAY.xlsx`.

## Cálculos — ATENCIÓN: fórmula de efecto confirmada contra el archivo real
Se verificó matemáticamente contra la propia columna "Efecto Tipo de Cambio"
y "Acumulado" del archivo del cliente. La fórmula real (y el signo) es:

- **TC promedio (ponderado)**: `suma(PESOS) / suma(DOLARES)`
- **Efecto TC por operación**: `(PESOS / TC_proyecto) − DOLARES_real`
  - **Positivo** = el TC real fue más favorable que el proyectado (peso más
    débil que lo presupuestado)
  - **Negativo** = pérdida vs. presupuesto (peso más fuerte que lo
    presupuestado — necesitó más USD para cubrir el mismo gasto en pesos)
  - Confirmado: con TC proyecto = 42, esta fórmula reproduce exacto el
    "Resultado Actual" = U$S -405.618,74 del archivo del cliente (suma de
    "Efecto Tipo de Cambio" sobre las 120 operaciones históricas, sin duplicados)
- **Efecto TC total**: suma del efecto por operación en el rango filtrado
- **Efecto acumulado**: suma corrida del efecto por operación, ordenado por fecha
- **TC mínimo**: es el TC **menos favorable** del período (rojo) — antes estaba
  al revés, corregido
- **TC máximo**: es el TC **más favorable** del período (verde) — antes estaba
  al revés, corregido
- Meses con TC promedio **por encima** del TC proyecto → favorable (verde).
  Por debajo → desfavorable (rojo). (Invertido respecto de la v1/v2 del brief.)



## Pantallas / componentes
(Igual al prototipo `dashboard.jsx` adjunto — replicar tal cual, conectado al
API route en lugar de al array embebido)
1. Header: rango de fechas (Desde/Hasta), TC Proyecto editable, contador de operaciones
2. KPI cards: USD operado, TC promedio, Efecto TC total, operaciones, TC mín/máx
3. Sección "Tipo de Cambio": línea TC real vs TC proyecto · barras TC promedio mensual
4. Sección "Efecto Tipo de Cambio": barras ganancia/pérdida por operación · área efecto acumulado

## Estilo visual
Igual al prototipo: fondo gris claro (#f1f5f9), cards blancas con borde sutil
(#e2e8f0), esquinas redondeadas (12px), Inter, verde (#16a34a) favorable / rojo
(#dc2626) desfavorable, azul (#3b82f6) TC proyecto, magenta (#c026d3) TC real.

## Pasos de deploy
1. Crear repo en GitHub (ej. `dashboard-tesoreria-fx`)
2. Subir este brief + `20260724_TC_CELTRAY.xlsx` + `dashboard.jsx` (referencia) al repo
3. Armar el proyecto Next.js localmente con Claude Code
4. Push a GitHub
5. Ir a vercel.com → "Add New Project" → importar el repo de GitHub → Deploy
   (Vercel detecta Next.js automáticamente, no requiere configuración extra)
6. Confirmar que cada push a `main` re-despliega solo

## Nota sobre historial de reportes
Como no hay base de datos, el historial de "reportes guardados" de la v1 queda
afuera por ahora (no hay dónde persistirlo sin DB). Si más adelante hace falta,
se puede agregar Vercel KV o una tabla simple sin perder este enfoque de "Excel
como fuente de verdad" para las operaciones.
