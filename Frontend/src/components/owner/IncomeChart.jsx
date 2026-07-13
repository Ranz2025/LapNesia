/**
 * IncomeChart.jsx
 * Smooth area chart — tampilan sesuai gambar referensi:
 * - Background sangat gelap (#0B1120)
 * - Garis teal tipis dan bersih
 * - Fill hanya bayangan sangat tipis
 * - X-axis format tanggal (01/07, 05/07, ...)
 * - Tooltip hover kecil gelap: "Pendapatan: Rp xxx"
 * - Klik titik → onPointClick(pointData) → buka modal detail
 */
import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ─── Formatter ─────────────────────────────────────────────── */
const fmtCurrency = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const fmtYAxis = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}rb`;
  return String(n);
};

/* ─── Tooltip kecil gelap ────────────────────────────────────── */
function HoverTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item  = payload[0];
  const value = item?.value;
  if (!value) return null;

  return (
    <div
      style={{
        background: "rgba(10,17,32,0.96)",
        border: "1px solid rgba(6,182,212,0.30)",
        borderRadius: 8,
        padding: "8px 14px",
        fontSize: 12,
        color: "#CBD5E1",
        fontFamily: "'Inter', sans-serif",
        whiteSpace: "nowrap",
        boxShadow: "0 6px 20px rgba(0,0,0,0.60)",
        pointerEvents: "none",
      }}
    >
      Pendapatan:{" "}
      <strong style={{ color: "#FFFFFF" }}>{fmtCurrency(value)}</strong>
    </div>
  );
}

/* ─── Active dot yang bisa diklik ────────────────────────────── */
function ActiveDot({ cx, cy, payload, onPointClick }) {
  if (!payload?.revenue || !cx || !cy) return null;
  return (
    <g>
      {/* Lingkaran luar transparan (area klik lebih luas) */}
      <circle
        cx={cx} cy={cy} r={14}
        fill="transparent"
        style={{ cursor: "pointer" }}
        onClick={(e) => { e.stopPropagation(); onPointClick?.(payload); }}
      />
      {/* Lingkaran luar glow */}
      <circle cx={cx} cy={cy} r={7}
        fill="rgba(6,182,212,0.15)"
        stroke="rgba(6,182,212,0.40)"
        strokeWidth={1}
        style={{ cursor: "pointer" }}
        onClick={(e) => { e.stopPropagation(); onPointClick?.(payload); }}
      />
      {/* Titik utama */}
      <circle cx={cx} cy={cy} r={4}
        fill="#06B6D4"
        stroke="#0B1120"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
        onClick={(e) => { e.stopPropagation(); onPointClick?.(payload); }}
      />
    </g>
  );
}

/* ─── Empty State ─────────────────────────────────────────────── */
function EmptyState({ period }) {
  const label =
    period === "weekly"  ? "minggu ini" :
    period === "yearly"  ? "tahun ini"  : "bulan ini";
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: 240, gap: 10,
    }}>
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
        stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
      <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
        Belum ada pendapatan {label}
      </p>
      <p style={{ fontSize: 11, color: "#1E293B", margin: 0 }}>
        Grafik muncul setelah ada transaksi berhasil
      </p>
    </div>
  );
}

/* ═══ MAIN COMPONENT ═════════════════════════════════════════════ */
export default function IncomeChart({
  data        = [],
  period      = "monthly",
  totalRevenue = 0,
  animated    = false,
  onPointClick = null,
  onChartClick = null, // backward-compat, tidak dipakai
}) {
  const hasRevenue = data.some((d) => Number(d.revenue) > 0);

  /* Siapkan data chart:
   * - revenue=0 → null agar kurva tidak drop ke dasar
   * - connectNulls=true akan menyambungkan titik yang ada data
   */
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        revenue: Number(d.revenue) > 0 ? Number(d.revenue) : null,
      })),
    [data]
  );

  const periodLabel =
    period === "weekly" ? "Pendapatan harian minggu ini" :
    period === "yearly" ? "Pendapatan bulanan tahun ini" :
                          "Pendapatan harian bulan ini";

  return (
    <div
      style={{
        background: "linear-gradient(160deg, #080E1A 0%, #0B1220 55%, #08111D 100%)",
        border: "1px solid rgba(6,182,212,0.12)",
        borderRadius: 18,
        padding: "20px 22px 12px",
        boxShadow:
          "0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        position: "relative",
        overflow: "hidden",
        animation: animated ? "chartFadeIn 0.5s ease" : "none",
      }}
    >
      {/* Ambient glow kiri bawah */}
      <div aria-hidden style={{
        position: "absolute", left: -80, bottom: -80,
        width: 320, height: 320, borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Header ── */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 4,
        flexWrap: "wrap",
        gap: 8,
        position: "relative",
        zIndex: 1,
      }}>
        {/* Kiri */}
        <div>
          <h2 style={{
            fontSize: 16, fontWeight: 800,
            color: "#E2E8F0",
            fontFamily: "'Baloo 2', sans-serif",
            margin: 0, letterSpacing: "-0.01em",
          }}>
            Income Analysis
          </h2>
          <p style={{ fontSize: 11, color: "#374151", margin: "3px 0 0 0" }}>
            {periodLabel}
          </p>
        </div>

        {/* Kanan: total + legend */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
          <span style={{
            fontSize: 15, fontWeight: 800,
            color: "#22D3EE",
            fontFamily: "'Baloo 2', sans-serif",
          }}>
            {fmtCurrency(totalRevenue)} Total
          </span>
          <span style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 11, color: "#4B5563",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#06B6D4", display: "inline-block",
              boxShadow: "0 0 6px rgba(6,182,212,0.6)",
            }} />
            Pendapatan Platform
          </span>
        </div>
      </div>

      {/* ── Chart ── */}
      <div style={{ position: "relative", zIndex: 1, marginTop: 6 }}>
        {!hasRevenue ? (
          <EmptyState period={period} />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={chartData}
              margin={{ top: 16, right: 6, left: 0, bottom: 0 }}
            >
              <defs>
                {/* Fill sangat tipis — hanya bayangan di bawah garis */}
                <linearGradient id="ig_rev_fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"    stopColor="#06B6D4" stopOpacity={0.22} />
                  <stop offset="60%"   stopColor="#06B6D4" stopOpacity={0.06} />
                  <stop offset="100%"  stopColor="#06B6D4" stopOpacity={0.00} />
                </linearGradient>

                {/* Glow pada garis */}
                <filter id="lineGlow" x="-20%" y="-50%" width="140%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid horizontal sangat halus */}
              <CartesianGrid
                strokeDasharray="0"
                stroke="rgba(255,255,255,0.03)"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={{ fill: "#374151", fontSize: 11, fontFamily: "'Inter',sans-serif" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                tickMargin={8}
              />

              <YAxis
                tickFormatter={fmtYAxis}
                tick={{ fill: "#374151", fontSize: 10, fontFamily: "'Inter',sans-serif" }}
                axisLine={false}
                tickLine={false}
                width={46}
                tickMargin={4}
              />

              <Tooltip
                content={<HoverTooltip />}
                cursor={{
                  stroke: "rgba(6,182,212,0.20)",
                  strokeWidth: 1,
                  strokeDasharray: "5 4",
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#06B6D4"
                strokeWidth={2}
                fill="url(#ig_rev_fill)"
                dot={false}
                connectNulls
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
                filter="url(#lineGlow)"
                activeDot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload?.revenue) return <g key={`empty-${cx}`} />;
                  return (
                    <ActiveDot
                      key={`dot-${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      payload={payload}
                      onPointClick={onPointClick}
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {hasRevenue && (
        <p style={{
          fontSize: 10, color: "#1E293B",
          margin: "4px 0 0 0", textAlign: "center",
          position: "relative", zIndex: 1,
        }}>
          Klik titik data pada grafik untuk melihat detail pendapatan hari tersebut
        </p>
      )}

      <style>{`
        @keyframes chartFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  );
}
