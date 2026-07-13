/**
 * RevenueChart.jsx — Area chart smooth seperti referensi gambar:
 * background silver/abu muda, garis + fill teal, kurva monotone,
 * tanpa titik, tanpa label di titik, grid horizontal tipis.
 */
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";

/* ─── Tokens ──────────────────────────────────────────────── */
const CLR_LINE     = "#2ABFBF";   // teal
const CLR_FILL_TOP = "#2ABFBF";
const CLR_BG       = "#EEF1F5";   // silver abu muda
const CLR_AXIS     = "#8B9BB0";
const CLR_GRID     = "rgba(180,193,210,0.45)";
const FONT         = "'Inter', sans-serif";
const FONT_DISPLAY = "'Baloo 2', sans-serif";

/* ─── Formatters ──────────────────────────────────────────── */
const fmtFull = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n || 0);

const fmtYAxis = (n) => {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000)     return `${(n / 1_000_000).toFixed(0)}jt`;
  if (abs >= 1_000)         return `${(n / 1_000).toFixed(0)}rb`;
  return String(n);
};

/* ─── Periods ─────────────────────────────────────────────── */
const PERIODS = [
  { value: "weekly",  label: "Per Minggu" },
  { value: "monthly", label: "Per Bulan"  },
  { value: "yearly",  label: "Per Tahun"  },
];

/* ─── Tooltip ─────────────────────────────────────────────── */
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #CFE0E8",
      borderRadius: 10,
      padding: "9px 14px",
      fontSize: 12,
      fontFamily: FONT,
      boxShadow: "0 6px 20px rgba(42,191,191,0.15)",
      minWidth: 155,
    }}>
      <p style={{ fontWeight: 700, color: "#0E7490", margin: "0 0 5px", fontSize: 12 }}>
        {d.date}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
        <span style={{ color: "#64748B" }}>Pendapatan</span>
        <span style={{ fontWeight: 700, color: CLR_LINE }}>{fmtFull(d.revenue)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, marginTop: 2 }}>
        <span style={{ color: "#64748B" }}>Order</span>
        <span style={{ fontWeight: 600, color: "#0891B2" }}>{d.orders}</span>
      </div>
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────── */
function EmptyState({ period }) {
  const lbl = period === "weekly" ? "minggu ini" : period === "yearly" ? "tahun ini" : "bulan ini";
  return (
    <div style={{
      height: 220, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      <TrendingUp size={32} color="rgba(42,191,191,0.35)" />
      <p style={{ fontSize: 13, color: CLR_AXIS, margin: 0 }}>Belum ada pendapatan {lbl}.</p>
    </div>
  );
}

/* ═══ MAIN ════════════════════════════════════════════════════ */
export default function RevenueChart({
  data          = {},
  defaultPeriod = "monthly",
}) {
  const [period, setPeriod] = useState(defaultPeriod);

  const raw       = data[period] ?? [];
  const chartData = useMemo(
    () => raw.map((d) => ({
      ...d,
      revenue: Number(d.revenue) || 0,
      orders:  Number(d.orders)  || 0,
    })),
    [raw]
  );

  const hasRevenue   = chartData.some((d) => d.revenue > 0);
  const totalRevenue = useMemo(() => chartData.reduce((s, d) => s + d.revenue, 0), [chartData]);
  const maxVal       = useMemo(() => Math.max(0, ...chartData.map((d) => d.revenue)), [chartData]);
  const yMax         = maxVal > 0 ? Math.ceil(maxVal * 1.25) : 100;

  const subtitle =
    period === "weekly"  ? "Pendapatan per hari minggu ini" :
    period === "yearly"  ? "Pendapatan per bulan tahun ini" :
                           "Pendapatan per minggu bulan ini";

  return (
    <div style={{
      background: CLR_BG,
      borderRadius: 18,
      padding: "20px 22px 14px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", marginBottom: 14,
        flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <h2 style={{
            fontSize: 14, fontWeight: 800, color: "#1E293B",
            fontFamily: FONT_DISPLAY, margin: 0,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <TrendingUp size={16} color={CLR_LINE} />
            Pendapatan Platform
          </h2>
          <p style={{ fontSize: 11, color: CLR_AXIS, margin: "2px 0 0" }}>{subtitle}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7 }}>
          <p style={{
            fontSize: 16, fontWeight: 800, color: CLR_LINE,
            fontFamily: FONT_DISPLAY, margin: 0,
          }}>
            {fmtFull(totalRevenue)}
          </p>
          {/* Toggle */}
          <div style={{
            display: "flex", gap: 2,
            background: "rgba(255,255,255,0.55)",
            borderRadius: 9, padding: "3px",
          }}>
            {PERIODS.map((p) => (
              <button key={p.value} onClick={() => setPeriod(p.value)} style={{
                padding: "4px 11px", borderRadius: 7, border: "none",
                cursor: "pointer", fontSize: 11, fontWeight: 600,
                fontFamily: FONT, transition: "all 0.16s",
                background: period === p.value ? CLR_LINE : "transparent",
                color:      period === p.value ? "#FFF"   : CLR_AXIS,
                boxShadow:  period === p.value ? "0 2px 6px rgba(42,191,191,0.35)" : "none",
              }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      {!hasRevenue ? <EmptyState period={period} /> : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rev_fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={CLR_FILL_TOP} stopOpacity={0.38} />
                <stop offset="55%"  stopColor={CLR_FILL_TOP} stopOpacity={0.12} />
                <stop offset="100%" stopColor={CLR_FILL_TOP} stopOpacity={0.00} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="0" stroke={CLR_GRID} vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fill: CLR_AXIS, fontSize: 11, fontFamily: FONT }}
              axisLine={{ stroke: "rgba(180,193,210,0.5)" }}
              tickLine={false}
              tickMargin={8}
              interval={0}
            />
            <YAxis
              tickFormatter={fmtYAxis}
              tick={{ fill: CLR_AXIS, fontSize: 11, fontFamily: FONT }}
              axisLine={false}
              tickLine={false}
              width={46}
              domain={[0, yMax]}
              tickCount={5}
            />

            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(42,191,191,0.30)", strokeWidth: 1, strokeDasharray: "4 3" }} />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CLR_LINE}
              strokeWidth={2.5}
              fill="url(#rev_fill)"
              dot={false}
              activeDot={{ r: 5, fill: CLR_LINE, stroke: "#FFF", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
