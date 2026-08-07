"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from "recharts";

const fmtUSD = (n) => "U$S " + n.toLocaleString("es-UY", { maximumFractionDigits: 0 });
const fmtUSD2 = (n) => "U$S " + n.toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPESOS = (n) => n.toLocaleString("es-UY", { maximumFractionDigits: 0 }) + " UYU";
const fmtTC = (n) => "$" + n.toLocaleString("es-UY", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const fmtDate = (s) => {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};
const monthLabel = (ym) => {
  const [y, m] = ym.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${meses[parseInt(m, 10) - 1]} ${y.slice(2)}`;
};

export default function Dashboard() {
  const [raw, setRaw] = useState(null);
  const [sensibilidad, setSensibilidad] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [tcBaseInput, setTcBaseInput] = useState("42.00");
  const tcBase = parseFloat(tcBaseInput) || 0;

  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const cargarOperaciones = () =>
    fetch("/api/operaciones")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRaw(data.operaciones);
        setSensibilidad(data.sensibilidad ?? null);
        return data;
      });

  useEffect(() => {
    cargarOperaciones()
      .then((data) => {
        setDesde(data.operaciones[0]?.fecha ?? null);
        setHasta(data.operaciones[data.operaciones.length - 1]?.fecha ?? null);
      })
      .catch((err) => setLoadError(err.message || "Error cargando operaciones"));
  }, []);

  async function handleUploadFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error subiendo el archivo");

      const nueva = await cargarOperaciones();
      setDesde(nueva.operaciones[0]?.fecha ?? null);
      setHasta(nueva.operaciones[nueva.operaciones.length - 1]?.fecha ?? null);
      setUploadStatus({ ok: true, text: "Datos actualizados ✓" });
    } catch (err) {
      setUploadStatus({ ok: false, text: err.message || "Error subiendo el archivo" });
    } finally {
      setUploading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!raw || !desde || !hasta) return [];
    return raw.filter((r) => r.fecha >= desde && r.fecha <= hasta);
  }, [raw, desde, hasta]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const totalUSD = filtered.reduce((a, r) => a + r.usd, 0);
    const totalPESOS = filtered.reduce((a, r) => a + r.pesos, 0);
    const tcPromedio = totalUSD > 0 ? totalPESOS / totalUSD : 0;
    const tcMin = Math.min(...filtered.map((r) => r.tc));
    const tcMax = Math.max(...filtered.map((r) => r.tc));
    // Efecto: USD reales obtenidos vs USD que hubiesen resultado de convertir
    // los mismos pesos al TC proyecto. Positivo = ganancia, negativo = pérdida.
    const efectoTotal = tcBase > 0 ? filtered.reduce((a, r) => a + (r.pesos / tcBase - r.usd), 0) : 0;
    return { totalUSD, totalPESOS, tcPromedio, tcMin, tcMax, efectoTotal, n: filtered.length };
  }, [filtered, tcBase]);

  const lineData = useMemo(
    () => filtered.map((r) => ({ fecha: fmtDate(r.fecha), tc: r.tc, tcBase })),
    [filtered, tcBase]
  );

  const monthly = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      const ym = r.fecha.slice(0, 7);
      if (!map[ym]) map[ym] = { usd: 0, pesos: 0 };
      map[ym].usd += r.usd;
      map[ym].pesos += r.pesos;
    });
    return Object.keys(map)
      .sort()
      .map((ym) => {
        const tcProm = map[ym].pesos / map[ym].usd;
        return {
          mes: monthLabel(ym),
          tcProm,
          tcBase,
          favorable: tcProm >= tcBase,
        };
      });
  }, [filtered, tcBase]);

  const gananciaPorOp = useMemo(
    () =>
      filtered.map((r) => ({
        fecha: fmtDate(r.fecha),
        efecto: tcBase > 0 ? r.pesos / tcBase - r.usd : 0,
      })),
    [filtered, tcBase]
  );

  const acumulado = useMemo(
    () =>
      gananciaPorOp.reduce((acc, r) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].acumulado : 0;
        acc.push({ fecha: r.fecha, acumulado: prev + r.efecto });
        return acc;
      }, []),
    [gananciaPorOp]
  );

  const pendientePesosTotal = sensibilidad?.pendientePesosTotal ?? null;
  const usdNecesariosAlProyecto =
    pendientePesosTotal != null && tcBase > 0 ? pendientePesosTotal / tcBase : null;

  const sensibilidadTabla = useMemo(() => {
    if (pendientePesosTotal == null || tcBase <= 0) return [];
    return (sensibilidad?.tcCandidatos ?? []).map((tc) => {
      const usdNecesario = pendientePesosTotal / tc;
      const diferencia = pendientePesosTotal / tcBase - usdNecesario;
      return { tc, usdNecesario, diferencia, esProyecto: Math.abs(tc - tcBase) <= 0.01 };
    });
  }, [sensibilidad, pendientePesosTotal, tcBase]);

  if (loadError) {
    return (
      <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#dc2626" }}>
        Error cargando operaciones: {loadError}
      </div>
    );
  }

  if (!raw) {
    return (
      <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#64748b" }}>
        Cargando operaciones…
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ background: "#f1f5f9", minHeight: "100%", fontFamily: "'Inter', -apple-system, sans-serif", padding: "24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <HeaderControls
            desde={desde} hasta={hasta} setDesde={setDesde} setHasta={setHasta}
            raw={raw} tcBaseInput={tcBaseInput} setTcBaseInput={setTcBaseInput}
            uploading={uploading} uploadStatus={uploadStatus} handleUploadFile={handleUploadFile}
            n={0}
          />
          <div style={{ padding: 40, color: "#64748b" }}>
            No hay operaciones en el rango de fechas seleccionado.
          </div>
        </div>
      </div>
    );
  }

  const diff = stats.tcPromedio - tcBase;

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100%", fontFamily: "'Inter', -apple-system, sans-serif", padding: "24px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Reporte operaciones tesorería
            </h1>
            <div style={{ color: "#64748b", fontSize: 13.5, marginTop: 4 }}>
              CELTRAY RESIDENCIAL · {fmtDate(desde)} → {fmtDate(hasta)} · {stats.n} operaciones · UYU
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <label style={fieldWrap}>
              <span style={fieldLabel}>Desde</span>
              <input
                type="date"
                value={desde}
                min={raw[0].fecha}
                max={hasta}
                onChange={(e) => setDesde(e.target.value)}
                style={fieldInput}
              />
            </label>
            <label style={fieldWrap}>
              <span style={fieldLabel}>Hasta</span>
              <input
                type="date"
                value={hasta}
                min={desde}
                max={raw[raw.length - 1].fecha}
                onChange={(e) => setHasta(e.target.value)}
                style={fieldInput}
              />
            </label>
            <div style={{ ...fieldWrap, background: "#eff6ff", borderColor: "#bfdbfe" }}>
              <span style={{ ...fieldLabel, color: "#1d4ed8" }}>TC Proyecto</span>
              <input
                type="number"
                step="0.01"
                value={tcBaseInput}
                onChange={(e) => setTcBaseInput(e.target.value)}
                style={{ ...fieldInput, color: "#1d4ed8", fontWeight: 700, width: 70 }}
              />
            </div>
            <label style={{ ...fieldWrap, cursor: uploading ? "default" : "pointer" }}>
              <span style={fieldLabel}>{uploading ? "Subiendo…" : "Subir Excel actualizado"}</span>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleUploadFile}
                disabled={uploading}
                style={{ display: "none" }}
              />
              {uploadStatus && (
                <span style={{ fontSize: 10.5, fontWeight: 600, color: uploadStatus.ok ? "#16a34a" : "#dc2626" }}>
                  {uploadStatus.text}
                </span>
              )}
            </label>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 24 }}>
          <Kpi label="USD CAMBIADOS" icon="$" value={fmtUSD(stats.totalUSD)} sub={fmtPESOS(stats.totalPESOS)} valueColor="#0f172a" />
          <Kpi
            label="TC PROMEDIO"
            icon="⇄"
            value={fmtTC(stats.tcPromedio)}
            sub={`TC proyecto: $${tcBase.toFixed(2)} · Diff: ${diff >= 0 ? "+" : ""}${diff.toFixed(2)}`}
            valueColor="#0f172a"
          />
          <Kpi
            label="EFECTO TC TOTAL"
            icon="↗"
            value={(stats.efectoTotal >= 0 ? "U$S +" : "U$S ") + stats.efectoTotal.toLocaleString("es-UY", { maximumFractionDigits: 2 })}
            sub={stats.efectoTotal >= 0 ? "Ganancia vs proyecto" : "Pérdida vs proyecto"}
            valueColor={stats.efectoTotal >= 0 ? "#16a34a" : "#dc2626"}
          />
          <Kpi label="OPERACIONES" icon="▦" value={String(stats.n)} sub={`${fmtDate(desde)} → ${fmtDate(hasta)}`} valueColor="#0f172a" />
          <Kpi label="TC MÍNIMO" icon="↘" value={fmtTC(stats.tcMin)} sub="Más desfavorable del período" valueColor="#dc2626" />
          <Kpi label="TC MÁXIMO" icon="↗" value={fmtTC(stats.tcMax)} sub="Más favorable del período" valueColor="#16a34a" />
        </div>

        {/* Tipo de Cambio */}
        <SectionTitle>Tipo de Cambio</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 28 }}>
          <ChartCard title="TC real vs TC proyecto" subtitle={`Cada operación comparada contra TC proyecto $${tcBase.toFixed(2)}`}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#94a3b8" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={["dataMin - 1", "dataMax + 1"]} tickFormatter={(v) => "$" + v.toFixed(0)} />
                <Tooltip formatter={(v, name) => [fmtTC(v), name === "tc" ? "TC Real" : "TC Proyecto"]} labelFormatter={(l) => `Fecha: ${l}`} />
                <Legend formatter={(v) => (v === "tc" ? "TC Real" : "TC Proyecto")} />
                <Line type="monotone" dataKey="tcBase" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="6 4" dot={false} name="tcBase" />
                <Line type="monotone" dataKey="tc" stroke="#c026d3" strokeWidth={2} dot={{ r: 2, fill: "#c026d3" }} name="tc" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="TC promedio mensual" subtitle="Promedio ponderado por USD operado">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#94a3b8" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => "$" + v.toFixed(0)} />
                <Tooltip formatter={(v) => [fmtTC(v), "TC Promedio"]} />
                <ReferenceLine y={tcBase} stroke="#3b82f6" strokeDasharray="6 4" />
                <Bar dataKey="tcProm" name="TC Promedio" radius={[3, 3, 0, 0]}>
                  {monthly.map((entry, i) => (
                    <Cell key={i} fill={entry.favorable ? "#22c55e" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Efecto Tipo de Cambio */}
        <SectionTitle>Efecto Tipo de Cambio</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
          <ChartCard title="Ganancia / Pérdida por operación" subtitle={`vs. TC proyecto $${tcBase.toFixed(2)} · en USD`}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gananciaPorOp} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 9, fill: "#94a3b8" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => "U$S " + (v / 1000).toFixed(0) + "k"} />
                <Tooltip formatter={(v) => [fmtUSD2(v), "Efecto"]} />
                <Bar dataKey="efecto" radius={[2, 2, 0, 0]}>
                  {gananciaPorOp.map((entry, i) => (
                    <Cell key={i} fill={entry.efecto >= 0 ? "#22c55e" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Efecto acumulado del TC" subtitle="Impacto financiero acumulado en USD">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={acumulado} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={stats.efectoTotal >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={stats.efectoTotal >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 9, fill: "#94a3b8" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => "U$S " + (v / 1000).toFixed(0) + "k"} />
                <Tooltip formatter={(v) => [fmtUSD2(v), "Acumulado"]} />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <Area type="monotone" dataKey="acumulado" stroke={stats.efectoTotal >= 0 ? "#16a34a" : "#dc2626"} strokeWidth={2} fill="url(#accGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Análisis de Sensibilidad a Futuro */}
        {pendientePesosTotal != null && (
          <>
            <SectionTitle>Análisis de Sensibilidad a Futuro</SectionTitle>
            <div style={{ marginBottom: 12 }}>
              <ChartCard
                title="Pendiente de obra: USD necesarios según el TC"
                subtitle="Pesos pendientes de cambiar, proyectados a distintos escenarios de TC"
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginBottom: 16 }}>
                  <div>
                    <div style={miniLabel}>PENDIENTE PESOS TOTAL</div>
                    <div style={miniValue}>{fmtPESOS(pendientePesosTotal)}</div>
                  </div>
                  <div>
                    <div style={miniLabel}>USD NECESARIOS AL TC PROYECTO (${tcBase.toFixed(2)})</div>
                    <div style={{ ...miniValue, color: "#1d4ed8" }}>{fmtUSD2(usdNecesariosAlProyecto)}</div>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>TC candidato</th>
                        <th style={thStyle}>USD necesarios</th>
                        <th style={thStyle}>Diferencia vs. TC proyecto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sensibilidadTabla.map((row) => (
                        <tr key={row.tc} style={{ background: row.esProyecto ? "#fef9c3" : "transparent" }}>
                          <td style={tdStyle}>${row.tc.toFixed(2)}</td>
                          <td style={tdStyle}>{fmtUSD2(row.usdNecesario)}</td>
                          <td style={{ ...tdStyle, color: row.diferencia >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                            {row.diferencia >= 0 ? "+" : ""}
                            {fmtUSD2(row.diferencia)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            </div>
          </>
        )}

        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 8, lineHeight: 1.6 }}>
          Metodología: el efecto por operación compara los USD que hubiesen resultado de convertir los pesos de esa
          operación al TC proyecto, contra los USD reales de la operación (Pesos/TC proyecto − USD real). Un valor
          positivo indica que el TC real fue más favorable que el proyectado (peso más débil que lo presupuestado).
          El análisis de sensibilidad compara, para los pesos pendientes de cambiar, los USD necesarios a cada TC
          candidato contra los USD necesarios al TC proyecto (Pendiente/TC proyecto − Pendiente/TC candidato). Un
          valor positivo indica que ese escenario de TC requeriría menos USD que el TC proyecto actual.
        </div>
      </div>
    </div>
  );
}

// --- helper components ---

function HeaderControls({ desde, hasta, setDesde, setHasta, raw, tcBaseInput, setTcBaseInput, uploading, uploadStatus, handleUploadFile }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Reporte operaciones tesorería
        </h1>
        <div style={{ color: "#64748b", fontSize: 13.5, marginTop: 4 }}>
          CELTRAY RESIDENCIAL · UYU
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <label style={fieldWrap}>
          <span style={fieldLabel}>Desde</span>
          <input type="date" value={desde ?? ""} max={hasta ?? undefined} onChange={(e) => setDesde(e.target.value)} style={fieldInput} />
        </label>
        <label style={fieldWrap}>
          <span style={fieldLabel}>Hasta</span>
          <input type="date" value={hasta ?? ""} min={desde ?? undefined} onChange={(e) => setHasta(e.target.value)} style={fieldInput} />
        </label>
        <div style={{ ...fieldWrap, background: "#eff6ff", borderColor: "#bfdbfe" }}>
          <span style={{ ...fieldLabel, color: "#1d4ed8" }}>TC Proyecto</span>
          <input
            type="number"
            step="0.01"
            value={tcBaseInput}
            onChange={(e) => setTcBaseInput(e.target.value)}
            style={{ ...fieldInput, color: "#1d4ed8", fontWeight: 700, width: 70 }}
          />
        </div>
        <label style={{ ...fieldWrap, cursor: uploading ? "default" : "pointer" }}>
          <span style={fieldLabel}>{uploading ? "Subiendo…" : "Subir Excel actualizado"}</span>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleUploadFile}
            disabled={uploading}
            style={{ display: "none" }}
          />
          {uploadStatus && (
            <span style={{ fontSize: 10.5, fontWeight: 600, color: uploadStatus.ok ? "#16a34a" : "#dc2626" }}>
              {uploadStatus.text}
            </span>
          )}
        </label>
      </div>
    </div>
  );
}

function Kpi({ label, icon, value, sub, valueColor }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span>{icon}</span> {label}
      </div>
      <div style={{ fontSize: 21, fontWeight: 800, color: valueColor, lineHeight: 1.15 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: 15, fontWeight: 700, color: "#334155", marginBottom: 12 }}>{children}</div>;
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>{title}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>{subtitle}</div>
      {children}
    </div>
  );
}

const fieldWrap = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "6px 10px",
};
const fieldLabel = { fontSize: 10, fontWeight: 700, color: "#64748b" };
const fieldInput = { border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: "#0f172a", background: "transparent", width: 110 };
const miniLabel = { fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, marginBottom: 4 };
const miniValue = { fontSize: 19, fontWeight: 800, color: "#0f172a" };
const thStyle = { textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", padding: "6px 10px", borderBottom: "1px solid #e2e8f0" };
const tdStyle = { padding: "7px 10px", borderBottom: "1px solid #f1f5f9", color: "#0f172a" };
