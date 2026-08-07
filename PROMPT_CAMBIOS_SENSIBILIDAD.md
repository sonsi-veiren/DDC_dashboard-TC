Quiero aplicar dos cambios al dashboard de tesorería (proyecto DDC_dashboard-TC):

1. Renombrar el KPI "USD OPERADO" a "USD CAMBIADOS" (mismo cálculo, solo cambia
   el título de la card).

2. Agregar una sección nueva "Análisis de Sensibilidad a Futuro", debajo de
   "Efecto Tipo de Cambio" y antes del pie de metodología. Necesita leer dos
   cosas más del mismo archivo Excel /data/20260724_TC_CELTRAY.xlsx, hoja
   "Efecto TC" (la misma hoja de donde ya se leen las operaciones):

   a) "Pendiente pesos total": buscar en la columna K la fila cuyo texto sea
      exactamente "Pesos pendientes" (case-insensitive) — el valor está en la
      columna L de esa misma fila. En el archivo actual está en la celda L24
      (fila 24, col L), con valor 466.633.174,03 — pero el parseo tiene que
      ubicarlo por el texto de la etiqueta, no por número de fila fijo, porque
      esa fila se puede correr cuando se actualice el archivo.

   b) Tabla "Sensibilidad TC": buscar en la columna K la fila con el texto
      "Sensibilidad TC" — las filas siguientes (saltando alguna fila vacía)
      tienen, en la columna K, los valores de TC candidatos (ej. 39, 39.81,
      40, 41, 41.31, 42, 42.04, 43, 44, 45 en el archivo actual). Parsear
      todas las filas consecutivas donde la columna K sea un número, hasta
      la primera fila vacía o no numérica. Ignorar la columna L de esa tabla
      (el archivo ya trae ahí una diferencia calculada, pero hay que
      RECALCULARLA en la app contra el TC Proyecto que el usuario edita en el
      dashboard, no usar el valor fijo del Excel).

   Con esos dos datos, la sección debe mostrar:
   - "Pendiente pesos total" y "USD necesarios al TC proyecto actual" (=
     pendiente_pesos / TC_proyecto)
   - Una tabla con cada TC candidato, los USD que se necesitarían a ese TC
     (pendiente_pesos / TC_candidato), y la diferencia contra el TC proyecto:
     diferencia = (pendiente_pesos / TC_proyecto) − (pendiente_pesos / TC_candidato)
     Positivo (verde) = favorable, necesitarías menos USD que al TC proyecto.
     Negativo (rojo) = desfavorable, necesitarías más USD.
   - Resaltar la fila donde TC_candidato == TC_proyecto (aprox, con tolerancia
     de 0.01) con fondo amarillo, igual que en la planilla Excel original.
   - Esta tabla se tiene que recalcular sola si el usuario cambia el input de
     "TC Proyecto" en el dashboard.

Referencia de diseño: el archivo dashboard.jsx (versión actualizada que ya
tiene esta sección implementada como prototipo, adjunto) — replicar ese mismo
layout, estilos y fórmulas en el proyecto real conectado al Excel.

---

3. Agregar un endpoint + botón en la UI para subir un Excel nuevo y que
   reemplace los datos, sin tener que hacer git push a GitHub cada vez.

   Como el proyecto no tiene base de datos (por diseño, Excel-en-el-repo),
   la forma más simple de agregar esto sin romper esa arquitectura es usar
   **Vercel Blob** (almacenamiento de archivos de Vercel, no es una base de
   datos relacional, es justo para este caso: guardar un archivo):

   a) Agregar el paquete `@vercel/blob` al proyecto.
   b) Crear un endpoint (`/api/upload` o similar) que reciba un archivo
      `.xlsx` desde un formulario, lo suba a Vercel Blob, y guarde ahí la
      referencia (puede ser simplemente sobrescribir siempre la misma clave/
      nombre en el Blob, ej. "operaciones-actual.xlsx", para no necesitar
      ninguna base de datos que trackee versiones).
   c) El endpoint que sirve los datos (`/api/operaciones`) debe: primero
      intentar leer el archivo desde Vercel Blob (si ya se subió uno); si no
      hay ninguno todavía, usar como fallback el archivo del repo
      `/data/20260724_TC_CELTRAY.xlsx` (así el dashboard nunca queda vacío
      antes de la primera subida).
   d) En la UI, agregar un botón simple "Subir Excel actualizado" cerca del
      header (donde está el input de TC Proyecto), con un `<input type="file"
      accept=".xlsx">` que llame al endpoint de upload. Después de subir con
      éxito, refrescar los datos en pantalla (volver a llamar a
      `/api/operaciones`) sin recargar toda la página.
   e) Mostrar feedback simple: "Subiendo…", "Datos actualizados ✓", o el
      error si el archivo no tiene la estructura esperada (hoja "Efecto TC"
      no encontrada, o columna de fecha vacía desde el inicio).
   f) No hace falta login/autenticación para este botón (uso interno, mismo
      criterio que el resto del dashboard).

   Nota: esto no reemplaza la opción de seguir actualizando por git push si
   se prefiere — ambos caminos deberían convivir (git push actualiza el
   archivo del repo, que sigue funcionando como fallback; subir por la UI
   actualiza el Blob, que tiene prioridad si existe).
