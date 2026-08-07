import { NextResponse } from "next/server";
import { readExcelBuffer } from "@/lib/readExcelSource";
import { readEfectoTCSheet, parseOperaciones } from "@/lib/parseOperaciones";
import { parseSensibilidad } from "@/lib/parseSensibilidad";

export async function GET() {
  try {
    const buffer = await readExcelBuffer();
    const sheet = readEfectoTCSheet(buffer);
    const operaciones = parseOperaciones(sheet);
    const sensibilidad = parseSensibilidad(sheet);
    return NextResponse.json({ operaciones, sensibilidad });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error leyendo el Excel" },
      { status: 500 }
    );
  }
}
