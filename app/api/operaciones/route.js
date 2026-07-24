import { NextResponse } from "next/server";
import { parseOperaciones } from "@/lib/parseOperaciones";

export async function GET() {
  try {
    const operaciones = parseOperaciones();
    return NextResponse.json({ operaciones });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error leyendo el Excel" },
      { status: 500 }
    );
  }
}
