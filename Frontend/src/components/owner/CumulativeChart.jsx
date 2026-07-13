/**
 * CumulativeChart.jsx
 * Area chart dark glassmorphism — pendapatan kumulatif platform dari awal sampai sekarang.
 * Garis selalu naik karena setiap bulan ditambahkan ke total sebelumnya.
 */
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

/* ─── Helpers ─────────────────────────────────────────────── */
const fmtCurrency = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const fmtCompact = (n) => {
  if (!n) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
};

/* ─── Tooltip ─────────────────────────────────────────────── */
function CumTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const cum  = payload.find((p) => p.dataKey === "cumulative");
  const mon  = payload.find((p) => p.dataKey === "monthly");
  const date = cum?.payload?.date ?? "";

  return (
    <div
      style={{
        background: "rgba(15,23,42,0.96)",
        border: "1px solid rgba(6,182,212,0.35)",
        borderRadius: 12,
        padding: "12px 16px",
        backdropFilter: "blur(12px)",
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        color: "#F1F5F9",
        boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
        minWidth: 210,
      }}
    >
      {date && (
        <p style={{ color: "#64748B", marginBottom: 7, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {date}
        </p>
      )}
      <p style={{ color: "#22D3EE", marginBottom: 4 }}>
        Total s.d. bulan ini:{" "}
        <strong style={{ color: "#FFFFFF" }}>
          {fmtCurrency(cum?.value ?? 0)}
        </strong>
      </p>
      {mon && (
        <p style={{ color: "#6EE7B7", fontSize: 12 }}>
          Bulan ini:{" "}
          <strong style={{ color: "#FFFFFF" }}>
            {fmtCurrency(mon.value ?? 0)}
          </strong>
        </p>
      )}
    </div>
  );
}

/* ─── Empty State ─────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 260, gap: 10 }}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="16" />
      </svg>
      <p style={{ fontSize: 13, color: "#475569" }}>Belum ada pendapatan tercatat</p>
      <p style={{ fontSize: 11, color: "#334155" }}>Data muncul setelah ada order yang dibayar</p>
    </div>
  );
}

/* ─── MAIN ────────────────────────────────────────────────── */
export default function CumulativeChart({ data = [], totalRevenue = 0, animated = false }) {
  const hasData = data.length > 0 && data.some((d) => d.cumulative > 0);

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #0B1120 0%, #0F1929 60%, #0A1524 100%)",
        border: "1px solid rgba(6,182,212,0.18)",
        borderRadius: 20,
        padding: "24px 28px 20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
        animation: animated ? "cumFadeIn 0.5s ease" : "none",
      }}
    >
      {/* ambient glows */}
      <div aria-hidden style={{ position: "absolute", left: -60, bottom: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", right: -40, top: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        <div>
          <p style={{ fontSize: 11, color: "#64748B", marginBottom: 4, letterSpacing: "0.05em" }}>
            Dari order pertama sampai sekarang
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", fontFamily: "'Baloo 2', sans-serif", margin: 0 }}>
            Pendapatan Kumulatif Platform
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {/* Total badge */}
          <span style={{
            background: "rgba(6,182,212,0.12)",
            border: "1px solid rgba(6,182,212,0.30)",
            borderRadius: 10,
            padding: "5px 14px",
            fontSize: 13,
            fontWeight: 700,
            color: "#22D3EE",
          }}>
            {fmtCurrency(totalRevenue)} Total
          </span>
          {/* Legends */}
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748B" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#06B6D4", display: "inline-block" }} />
              Kumulatif
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748B" }}>
              <span style={{ width: 8, height: 3, background: "#34D399", display: "inline-block", borderRadius: 2 }} />
              Bulanan
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {!hasData ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                {/* Gradient area kumulatif — cyan */}
                <linearGradient id="cum_grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#06B6D4" stopOpacity={0.40} />
                  <stop offset="60%"  stopColor="#06B6D4" stopOpacity={0.10} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
                {/* Gradient area bulanan — hijau tipis */}
                <linearGradient id="mon_grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#34D399" stopOpacity={0.20} />
                  <stop offset="100%" stopColor="#34D399" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false} />

              <XAxis
                dataKey="label"
                tick={{ fill: "#4B5563", fontSize: 11, fontFamily: "'Inter',sans-serif" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                tickFormatter={fmtCompact}
                tick={{ fill: "#4B5563", fontSize: 10, fontFamily: "'Inter',sans-serif" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />

              <Tooltip
                content={<CumTooltip />}
                cursor={{ stroke: "rgba(6,182,212,0.25)", strokeWidth: 1, strokeDasharray: "4 4" }}
              />

              {/* Area bulanan (hijau, di belakang) */}
              <Area
                type="monotone"
                dataKey="monthly"
                stroke="#34D399"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="url(#mon_grad)"
                dot={false}
                isAnimationActive
                animationDuration={900}
                activeDot={{ r: 4, fill: "#34D399", stroke: "#0B1120", strokeWidth: 2 }}
              />

              {/* Area kumulatif (cyan, di depan) — selalu naik */}
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#06B6D4"
                strokeWidth={2.5}
                fill="url(#cum_grad)"
                dot={false}
                isAnimationActive
                animationDuration={900}
                activeDot={{ r: 5, fill: "#06B6D4", stroke: "#0B1120", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <style>{`
        @keyframes cumFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
