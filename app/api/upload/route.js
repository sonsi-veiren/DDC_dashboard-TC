import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { BLOB_PATHNAME } from "@/lib/readExcelSource";
import { readEfectoTCSheet, parseOperaciones } from "@/lib/parseOperaciones";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let operaciones;
  try {
    const sheet = readEfectoTCSheet(buffer);
    operaciones = parseOperaciones(sheet);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo leer el Excel" },
      { status: 400 }
    );
  }

  if (operaciones.length === 0) {
    return NextResponse.json(
      { error: "No se encontraron operaciones válidas: la columna de fecha está vacía desde el inicio" },
      { status: 400 }
    );
  }

  try {
    await put(BLOB_PATHNAME, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo guardar el archivo (Vercel Blob no está configurado): " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, operaciones: operaciones.length });
}
