# Dashboard Tesorería FX — CELTRAY RESIDENCIAL

Dashboard de operaciones de tesorería (cambio UYU/USD), sin base de datos: los
datos viven en `/data/20260724_TC_CELTRAY.xlsx` dentro del repo y la app los
lee y calcula todo al vuelo en un API route de Next.js.

Ver `BRIEF_CLAUDE_CODE_V2_VERCEL.md` para el detalle del formato de la
planilla y las fórmulas.

## Stack
- Next.js (App Router) + Tailwind + Recharts
- `xlsx` (SheetJS) en el servidor para parsear el Excel (`lib/parseOperaciones.js`)
- Sin base de datos: para actualizar los datos, se reemplaza el archivo en
  `/data` y se hace push — Vercel redeploya solo.

## Desarrollo local
```bash
npm install
npm run dev
```
Abrir http://localhost:3000

## Actualizar los datos
Reemplazar `data/20260724_TC_CELTRAY.xlsx` por la planilla nueva (misma hoja
"Efecto TC", mismo layout de columnas D-F) y hacer commit + push.

## Deploy
Importar el repo en Vercel ("Add New Project"). Next.js se detecta
automáticamente, no requiere configuración extra. Cada push a `main`
redeploya solo.
