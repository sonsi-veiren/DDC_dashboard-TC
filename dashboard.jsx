import React, { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from "recharts";


const RAW = [{"fecha": "2023-11-09", "usd": 3780.24, "pesos": 150000, "tc": 39.68}, {"fecha": "2023-11-20", "usd": 2297.67, "pesos": 90000, "tc": 39.1701}, {"fecha": "2023-11-28", "usd": 5726.07, "pesos": 222000, "tc": 38.77}, {"fecha": "2023-12-19", "usd": 1278.77, "pesos": 50000, "tc": 39.1001}, {"fecha": "2023-12-28", "usd": 9027.59, "pesos": 350000, "tc": 38.77}, {"fecha": "2024-03-01", "usd": 3608.24, "pesos": 140000, "tc": 38.8001}, {"fecha": "2024-03-19", "usd": 31054.27, "pesos": 1190000, "tc": 38.32}, {"fecha": "2024-03-20", "usd": 20927.15, "pesos": 790000, "tc": 37.75}, {"fecha": "2024-03-22", "usd": 5066.66, "pesos": 190000, "tc": 37.5}, {"fecha": "2024-04-01", "usd": 26490.06, "pesos": 1000000, "tc": 37.75}, {"fecha": "2024-07-02", "usd": 27930.17, "pesos": 1120000, "tc": 40.1}, {"fecha": "2024-07-09", "usd": 5527.63, "pesos": 220000, "tc": 39.8001}, {"fecha": "2024-07-23", "usd": 3624.09, "pesos": 145000, "tc": 40.01}, {"fecha": "2024-07-24", "usd": 1747.81, "pesos": 70000, "tc": 40.0501}, {"fecha": "2024-08-02", "usd": 6203.47, "pesos": 250000, "tc": 40.3}, {"fecha": "2024-08-13", "usd": 1614.9, "pesos": 65000, "tc": 40.2502}, {"fecha": "2024-08-16", "usd": 7098.38, "pesos": 285000, "tc": 40.15}, {"fecha": "2024-08-26", "usd": 4119.85, "pesos": 165000, "tc": 40.05}, {"fecha": "2024-09-05", "usd": 1245.01, "pesos": 50000, "tc": 40.1603}, {"fecha": "2024-09-10", "usd": 1241.92, "pesos": 50000, "tc": 40.2602}, {"fecha": "2024-09-24", "usd": 4996.68, "pesos": 210000, "tc": 42.0279}, {"fecha": "2024-10-17", "usd": 1811.59, "pesos": 75000, "tc": 41.4001}, {"fecha": "2024-10-30", "usd": 2184.46, "pesos": 90000, "tc": 41.2001}, {"fecha": "2024-10-31", "usd": 1206.27, "pesos": 50000, "tc": 41.4501}, {"fecha": "2024-11-06", "usd": 1201.92, "pesos": 50000, "tc": 41.6001}, {"fecha": "2024-11-11", "usd": 1185.95, "pesos": 50000, "tc": 42.1603}, {"fecha": "2024-11-25", "usd": 47563.26, "pesos": 2030000, "tc": 42.68}, {"fecha": "2024-11-26", "usd": 12895.66, "pesos": 550000, "tc": 42.65}, {"fecha": "2024-12-03", "usd": 11157.6, "pesos": 480000, "tc": 43.02}, {"fecha": "2024-12-12", "usd": 16949.15, "pesos": 750000, "tc": 44.25}, {"fecha": "2024-12-18", "usd": 14179.6, "pesos": 630000, "tc": 44.43}, {"fecha": "2024-12-20", "usd": 63091.48, "pesos": 2800000, "tc": 44.38}, {"fecha": "2025-01-10", "usd": 4566.21, "pesos": 200000, "tc": 43.8}, {"fecha": "2025-01-14", "usd": 1715.46, "pesos": 75000, "tc": 43.7201}, {"fecha": "2025-01-15", "usd": 3199.26, "pesos": 140000, "tc": 43.7601}, {"fecha": "2025-01-16", "usd": 1141.55, "pesos": 50000, "tc": 43.8001}, {"fecha": "2025-01-24", "usd": 2088.16, "pesos": 90000, "tc": 43.1001}, {"fecha": "2025-01-29", "usd": 1162.79, "pesos": 50000, "tc": 43.0}, {"fecha": "2025-02-10", "usd": 54272.52, "pesos": 2350000, "tc": 43.3}, {"fecha": "2025-02-26", "usd": 68203.3, "pesos": 2885000, "tc": 42.3}, {"fecha": "2025-03-20", "usd": 166270.78, "pesos": 7000000, "tc": 42.1}, {"fecha": "2025-03-24", "usd": 35671.82, "pesos": 1500000, "tc": 42.05}, {"fecha": "2025-03-28", "usd": 76190.48, "pesos": 3200000, "tc": 42.0}, {"fecha": "2025-03-31", "usd": 1905.66, "pesos": 80000, "tc": 41.9802}, {"fecha": "2025-04-03", "usd": 1431.29, "pesos": 60000, "tc": 41.9202}, {"fecha": "2025-04-04", "usd": 16292.8, "pesos": 690000, "tc": 42.35}, {"fecha": "2025-04-08", "usd": 5275.49, "pesos": 225000, "tc": 42.6501}, {"fecha": "2025-04-09", "usd": 3139.53, "pesos": 135000, "tc": 43.0001}, {"fecha": "2025-04-10", "usd": 304428.9, "pesos": 13060000, "tc": 42.9}, {"fecha": "2025-04-22", "usd": 1915.25, "pesos": 80000, "tc": 41.77}, {"fecha": "2025-04-23", "usd": 2403.84, "pesos": 100000, "tc": 41.6001}, {"fecha": "2025-04-25", "usd": 52556.48, "pesos": 2210000, "tc": 42.05}, {"fecha": "2025-04-30", "usd": 1436.09, "pesos": 60000, "tc": 41.7801}, {"fecha": "2025-05-06", "usd": 2409.63, "pesos": 100000, "tc": 41.5001}, {"fecha": "2025-05-07", "usd": 2442, "pesos": 100000, "tc": 40.95}, {"fecha": "2025-05-16", "usd": 26347.31, "pesos": 1100000, "tc": 41.75}, {"fecha": "2025-05-19", "usd": 174488.57, "pesos": 7250000, "tc": 41.55}, {"fecha": "2025-05-22", "usd": 40289.51, "pesos": 1670000, "tc": 41.45}, {"fecha": "2025-05-27", "usd": 216525.93, "pesos": 8975000, "tc": 41.45}, {"fecha": "2025-05-30", "usd": 3617.07, "pesos": 150000, "tc": 41.47}, {"fecha": "2025-06-04", "usd": 3690.03, "pesos": 150000, "tc": 40.6501}, {"fecha": "2025-06-05", "usd": 6782.51, "pesos": 280000, "tc": 41.2827}, {"fecha": "2025-06-06", "usd": 2908.38, "pesos": 120000, "tc": 41.2601}, {"fecha": "2025-06-23", "usd": 62189.05, "pesos": 2500000, "tc": 40.2}, {"fecha": "2025-06-27", "usd": 325786.16, "pesos": 12950000, "tc": 39.75}, {"fecha": "2025-07-07", "usd": 15644.4, "pesos": 630000, "tc": 40.27}, {"fecha": "2025-07-09", "usd": 7080.74, "pesos": 285000, "tc": 40.25}, {"fecha": "2025-07-21", "usd": 336579.28, "pesos": 13480000, "tc": 40.05}, {"fecha": "2025-07-22", "usd": 69563.03, "pesos": 2770000, "tc": 39.82}, {"fecha": "2025-07-30", "usd": 45386.57, "pesos": 1815000, "tc": 39.9898}, {"fecha": "2025-08-07", "usd": 2006.01, "pesos": 80000, "tc": 39.8802}, {"fecha": "2025-08-21", "usd": 69709.12, "pesos": 2780000, "tc": 39.88}, {"fecha": "2025-08-22", "usd": 5403.36, "pesos": 215000, "tc": 39.7901}, {"fecha": "2025-08-27", "usd": 351337.74, "pesos": 14025000, "tc": 39.9189}, {"fecha": "2025-08-29", "usd": 15471.69, "pesos": 615000, "tc": 39.75}, {"fecha": "2025-09-19", "usd": 595921.45, "pesos": 23670000, "tc": 39.72}, {"fecha": "2025-09-29", "usd": 1889.16, "pesos": 75000, "tc": 39.7002}, {"fecha": "2025-10-02", "usd": 4530.58, "pesos": 180000, "tc": 39.73}, {"fecha": "2025-10-06", "usd": 15601.4, "pesos": 620000, "tc": 39.74}, {"fecha": "2025-10-21", "usd": 120186.26, "pesos": 4775000, "tc": 39.73}, {"fecha": "2025-10-22", "usd": 475753.77, "pesos": 18935000, "tc": 39.8}, {"fecha": "2025-10-23", "usd": 2022.24, "pesos": 80000, "tc": 39.5601}, {"fecha": "2025-10-30", "usd": 4664.64, "pesos": 185000, "tc": 39.6601}, {"fecha": "2025-11-03", "usd": 21349.16, "pesos": 845000, "tc": 39.58}, {"fecha": "2025-11-07", "usd": 1514.38, "pesos": 60000, "tc": 39.6202}, {"fecha": "2025-11-14", "usd": 179722.92, "pesos": 7135000, "tc": 39.7}, {"fecha": "2025-11-21", "usd": 663450.62, "pesos": 26210000, "tc": 39.5056}, {"fecha": "2025-11-26", "usd": 3293.63, "pesos": 130000, "tc": 39.4701}, {"fecha": "2025-12-03", "usd": 49935.98, "pesos": 1950000, "tc": 39.05}, {"fecha": "2025-12-19", "usd": 661378.23, "pesos": 25750000, "tc": 38.9338}, {"fecha": "2025-12-23", "usd": 1536.09, "pesos": 60000, "tc": 39.0602}, {"fecha": "2026-01-08", "usd": 20592.02, "pesos": 800000, "tc": 38.85}, {"fecha": "2026-01-16", "usd": 2090.95, "pesos": 80000, "tc": 38.2601}, {"fecha": "2026-01-23", "usd": 137433.86, "pesos": 5195000, "tc": 37.8}, {"fecha": "2026-01-26", "usd": 414741.04, "pesos": 15615000, "tc": 37.65}, {"fecha": "2026-01-27", "usd": 10526.32, "pesos": 400000, "tc": 38.0}, {"fecha": "2026-02-04", "usd": 7786.14, "pesos": 300000, "tc": 38.53}, {"fecha": "2026-02-11", "usd": 4669.26, "pesos": 180000, "tc": 38.55}, {"fecha": "2026-02-23", "usd": 343080.93, "pesos": 13140000, "tc": 38.3}, {"fecha": "2026-02-24", "usd": 2608.24, "pesos": 100000, "tc": 38.34}, {"fecha": "2026-03-10", "usd": 15538.85, "pesos": 620000, "tc": 39.9}, {"fecha": "2026-03-11", "usd": 1620.13, "pesos": 65000, "tc": 40.1202}, {"fecha": "2026-03-12", "usd": 6203.47, "pesos": 250000, "tc": 40.3}, {"fecha": "2026-03-19", "usd": 1482.57, "pesos": 60000, "tc": 40.4703}, {"fecha": "2026-03-20", "usd": 529223.97, "pesos": 21550000, "tc": 40.72}, {"fecha": "2026-03-24", "usd": 5947.95, "pesos": 240000, "tc": 40.35}, {"fecha": "2026-03-26", "usd": 1236.39, "pesos": 50000, "tc": 40.4403}, {"fecha": "2026-04-13", "usd": 2503.12, "pesos": 100000, "tc": 39.9501}, {"fecha": "2026-04-24", "usd": 89480.35, "pesos": 3530000, "tc": 39.45}, {"fecha": "2026-04-29", "usd": 4342.43, "pesos": 175000, "tc": 40.3}, {"fecha": "2026-04-30", "usd": 17786.06, "pesos": 715000, "tc": 40.2}, {"fecha": "2026-05-05", "usd": 323735.6, "pesos": 12930000, "tc": 39.94}, {"fecha": "2026-05-13", "usd": 4375, "pesos": 175000, "tc": 40.0}, {"fecha": "2026-05-21", "usd": 286415.09, "pesos": 11385000, "tc": 39.75}, {"fecha": "2026-05-25", "usd": 102002.5, "pesos": 4075000, "tc": 39.95}, {"fecha": "2026-05-28", "usd": 2496.87, "pesos": 100000, "tc": 40.0501}, {"fecha": "2026-06-02", "usd": 1246.88, "pesos": 50000, "tc": 40.1001}, {"fecha": "2026-06-22", "usd": 98750, "pesos": 3950000, "tc": 40.0}, {"fecha": "2026-06-25", "usd": 317762.83, "pesos": 12755000, "tc": 40.14}, {"fecha": "2026-06-30", "usd": 10741.94, "pesos": 430000, "tc": 40.03}];

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
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${meses[parseInt(m,10)-1]} ${y.slice(2)}`;
};

export default function Dashboard() {
  const [desde, setDesde] = useState(RAW[0].fecha);
  const [hasta, setHasta] = useState(RAW[RAW.length - 1].fecha);
  const [tcBaseInput, setTcBaseInput] = useState("42.00");
  const tcBase = parseFloat(tcBaseInput) || 0;

  const filtered = useMemo(
    () => RAW.filter((r) => r.fecha >= desde && r.fecha <= hasta),
    [desde, hasta]
  );

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

  const acumulado = useMemo(() => {
    let acc = 0;
    return gananciaPorOp.map((r) => {
      acc += r.efecto;
      return { fecha: r.fecha, acumulado: acc };
    });
  }, [gananciaPorOp]);

  if (!stats) {
    return (
      <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#64748b" }}>
        No hay operaciones en el rango de fechas seleccionado.
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
                min={RAW[0].fecha}
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
                max={RAW[RAW.length - 1].fecha}
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
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 24 }}>
          <Kpi label="USD OPERADO" icon="$" value={fmtUSD(stats.totalUSD)} sub={fmtPESOS(stats.totalPESOS)} valueColor="#0f172a" />
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

        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 8, lineHeight: 1.6 }}>
          Metodología: el efecto por operación compara los USD que hubiesen resultado de convertir los pesos de esa
          operación al TC proyecto, contra los USD reales de la operación (Pesos/TC proyecto − USD real). Un valor
          positivo indica que el TC real fue más favorable que el proyectado (peso más débil que lo presupuestado).
        </div>
      </div>
    </div>
  );
}

// --- helper components ---

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
