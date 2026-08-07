# Dashboard Tesorería FX — CELTRAY RESIDENCIAL

Dashboard de operaciones de tesorería (cambio UYU/USD), sin base de datos: los
datos viven en `/data/20260724_TC_CELTRAY.xlsx` dentro del repo y la app los
lee y calcula todo al vuelo en un API route de Next.js.

Ver `BRIEF_CLAUDE_CODE_V2_VERCEL.md` para el detalle del formato de la
planilla y las fórmulas.

## Stack
- Next.js (App Router) + Tailwind + Recharts
- `xlsx` (SheetJS) en el servidor para parsear el Excel (`lib/parseOperaciones.js`,
  `lib/parseSensibilidad.js`)
- `@vercel/blob` para permitir subir un Excel nuevo desde la propia UI, sin DB
- Sin base de datos: para actualizar los datos, se reemplaza el archivo en
  `/data` y se hace push (o se sube desde la UI, ver abajo) — Vercel redeploya
  o refresca solo.

## Desarrollo local
```bash
npm install
npm run dev
```
Abrir http://localhost:3000

## Actualizar los datos
Dos formas, conviven sin pisarse:
1. **Desde la UI**: botón "Subir Excel actualizado" en el header (mismo
   formato, hoja "Efecto TC"). Requiere que el proyecto tenga conectado un
   Vercel Blob store (variable de entorno `BLOB_READ_WRITE_TOKEN`, la agrega
   Vercel automáticamente al crear el store). Sin esa variable configurada
   (ej. en desarrollo local) el botón devuelve un error claro; el dashboard
   sigue funcionando con el archivo del repo.
2. **Por git**: reemplazar `data/20260724_TC_CELTRAY.xlsx` por la planilla
   nueva (misma hoja "Efecto TC", mismo layout de columnas D-F, K-L) y hacer
   commit + push.

El endpoint `/api/operaciones` prioriza el archivo subido a Blob si existe;
si no hay ninguno, usa como fallback el archivo del repo.

## Deploy
Importar el repo en Vercel ("Add New Project"). Next.js se detecta
automáticamente, no requiere configuración extra. Cada push a `main`
redeploya solo. Para habilitar la subida de Excel desde la UI, crear un
Blob store en el proyecto de Vercel (Storage → Create Database → Blob) —
la variable `BLOB_READ_WRITE_TOKEN` queda configurada automáticamente.
