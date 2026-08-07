import * as XLSX from "xlsx";

const COL_LABEL = "K";
const COL_VALUE = "L";
const LABEL_PENDIENTE = "pesos pendientes";
const LABEL_SENSIBILIDAD = "sensibilidad tc";
const MAX_BLANK_ROWS_SKIPPED = 10;

function cellText(sheet, addr) {
  const cell = sheet[addr];
  return typeof cell?.v === "string" ? cell.v.trim() : null;
}

function cellNumber(sheet, addr) {
  const cell = sheet[addr];
  return typeof cell?.v === "number" ? cell.v : null;
}

/**
 * A partir de la hoja "Efecto TC", ubica por texto de etiqueta (no por número
 * de fila fijo, ya que se corre cada vez que se reemplaza el Excel):
 * - "Pendiente pesos total": fila con etiqueta "Pesos pendientes" en la
 *   columna K, valor en la columna L de esa misma fila.
 * - "Sensibilidad TC": fila con etiqueta "Sensibilidad TC" en la columna K;
 *   las filas siguientes (saltando alguna fila vacía) traen, en la columna K,
 *   los TC candidatos. Se ignora la columna L de esa tabla — la diferencia
 *   contra el TC proyecto se recalcula siempre en la app.
 */
export function parseSensibilidad(sheet) {
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  let pendientePesosTotal = null;
  let sensibilidadRow = null;

  for (let row = range.s.r + 1; row <= range.e.r + 1; row++) {
    const label = cellText(sheet, `${COL_LABEL}${row}`);
    if (!label) continue;
    const normalized = label.toLowerCase();
    if (pendientePesosTotal === null && normalized === LABEL_PENDIENTE) {
      pendientePesosTotal = cellNumber(sheet, `${COL_VALUE}${row}`);
    }
    if (sensibilidadRow === null && normalized === LABEL_SENSIBILIDAD) {
      sensibilidadRow = row;
    }
  }

  const tcCandidatos = [];
  if (sensibilidadRow !== null) {
    let row = sensibilidadRow + 1;
    let blankRowsSkipped = 0;
    while (
      cellNumber(sheet, `${COL_LABEL}${row}`) === null &&
      cellText(sheet, `${COL_LABEL}${row}`) === null &&
      blankRowsSkipped < MAX_BLANK_ROWS_SKIPPED
    ) {
      row++;
      blankRowsSkipped++;
    }
    while (true) {
      const value = cellNumber(sheet, `${COL_LABEL}${row}`);
      if (value === null) break;
      tcCandidatos.push(value);
      row++;
    }
  }

  return { pendientePesosTotal, tcCandidatos };
}
