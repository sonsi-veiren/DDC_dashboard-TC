import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

const EXCEL_PATH = path.join(process.cwd(), "data", "20260724_TC_CELTRAY.xlsx");
const SHEET_NAME = "Efecto TC";
const FIRST_DATA_ROW = 6; // fila 5 = headers, fila 6 en adelante = operaciones
const COL_FECHA = "D";
const COL_USD = "E";
const COL_PESOS = "F";

function isValidDate(value) {
  return value instanceof Date && !isNaN(value.getTime());
}

function toISODate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Lee /data/20260724_TC_CELTRAY.xlsx y devuelve las operaciones (fecha, usd, pesos)
 * ya deduplicadas y ordenadas. La hoja "Efecto TC" trae, a la izquierda de la
 * tabla de operaciones (col D-F), celdas de resumen sueltas y, a la derecha
 * (col J en adelante), tablas auxiliares sin relación: se ignoran ambas.
 * Las columnas G/H/I (TC, Efecto, Acumulado) del archivo no se usan — se
 * recalculan siempre en la app para ser robustos a cómo venga la planilla.
 */
export function parseOperaciones() {
  const buffer = fs.readFileSync(EXCEL_PATH);
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    throw new Error(`No se encontró la hoja "${SHEET_NAME}" en el Excel`);
  }

  const rows = [];
  let row = FIRST_DATA_ROW;
  while (true) {
    const fechaCell = sheet[`${COL_FECHA}${row}`];
    const fecha = fechaCell?.v;
    if (!isValidDate(fecha)) break;

    const usdCell = sheet[`${COL_USD}${row}`];
    const pesosCell = sheet[`${COL_PESOS}${row}`];
    const usd = typeof usdCell?.v === "number" ? usdCell.v : null;
    const pesos = typeof pesosCell?.v === "number" ? pesosCell.v : null;

    if (usd !== null && pesos !== null && usd !== 0) {
      rows.push({ fecha: toISODate(fecha), usd, pesos, tc: pesos / usd });
    }
    row++;
  }

  // Deduplicar filas exactamente iguales (misma Fecha + Importe U$S + Importe $)
  const seen = new Set();
  const deduped = [];
  for (const r of rows) {
    const key = `${r.fecha}|${r.usd}|${r.pesos}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(r);
  }

  deduped.sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
  return deduped;
}
