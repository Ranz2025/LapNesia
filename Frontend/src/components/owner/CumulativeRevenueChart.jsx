/**
 * CumulativeRevenueChart.jsx
 *
 * Line chart kumulatif pendapatan platform per bulan.
 * Tampilan: background putih/light, garis biru, titik segitiga,
 * label nilai di atas setiap titik, sumbu X = bulan/tahun,
 * sumbu Y = nominal (format kompak).
 */
import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";

/* ─── Formatters ─────────────────────────────────────────────── */
const fmtYAxis = (n) => {
  if (n === 0) return "0";
  if (Math.abs(n) >= 1_000_000_000)
    return `${(n / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000_000)
    return `${(n / 1_000_000).toFixed(0)}jt`;
  if (Math.abs(n) >= 1_000)
    return `${(n / 1_000).toFixed(0)}rb`;
  return String(n);
};

const fmtFull = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const fmtCompact = (n) =>
  new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(n || 0);

/* ─── Tooltip ────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #BFDBFE",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 12,
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 8px 24px rgba(37,99,235,0.12)",
        minWidth: 180,
      }}
    >
      <p
        style={{
          fontWeight: 700,
          color: "#1E40AF",
          margin: "0 0 6px",
          fontSize: 13,
        }}
      >
        {d?.date || label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: "#64748B" }}>Kumulatif</span>
          <span style={{ fontWeight: 700, color: "#2563EB" }}>
            {fmtFull(d?.cumulative)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: "#64748B" }}>Bulan ini</span>
          <span style={{ fontWeight: 600, color: "#0891B2" }}>
            {fmtFull(d?.monthly)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Label nilai di atas titik ──────────────────────────────── */
function ValueLabel({ x, y, value, index, data }) {
  if (!value && value !== 0) return null;

  // Jangan render label jika terlalu rapat (tampilkan hanya setiap nth)
  const total = data?.length || 1;
  const step = total <= 8 ? 1 : total <= 16 ? 2 : 3;
  if (index % step !== 0 && index !== total - 1) return null;

  const label = fmtCompact(value);
  const rectW = label.length * 7 + 8;

  return (
    <g>
      {/* Label teks */}
      <text
        x={x}
        y={y - 16}
        textAnchor="middle"
        fontSize={10}
        fontFamily="'Inter', sans-serif"
        fill="#2563EB"
        fontWeight={600}
      >
        {label}
      </text>
    </g>
  );
}

/* ─── Custom dot segitiga (▲) ────────────────────────────────── */
function TriangleDot({ cx, cy, value, fill = "#7BBCEF", stroke = "#5A9FD4" }) {
  if (!value && value !== 0) return null;
  if (!cx || !cy) return null;

  const size = 6;
  // Segitiga mengarah ke atas
  const pts = `${cx},${cy - size} ${cx - size},${cy + size * 0.6} ${cx + size},${cy + size * 0.6}`;

  return (
    <polygon
      points={pts}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.2}
      style={{ cursor: "default" }}
    />
  );
}

/* ─── Empty State ─────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 240,
        gap: 10,
      }}
    >
      <TrendingUp size={36} color="#CBD5E1" />
      <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
        Belum ada data pendapatan kumulatif.
      </p>
      <p style={{ fontSize: 11, color: "#CBD5E1", margin: 0 }}>
        Grafik muncul setelah ada transaksi berhasil.
      </p>
    </div>
  );
}

/* ═══ MAIN COMPONENT ═════════════════════════════════════════════ */
export default function CumulativeRevenueChart({ data = [] }) {
  const hasData = data.some((d) => Number(d.cumulative) > 0);

  // Filter hanya data yang ada nilai (tidak semua nol berturut-turut di depan)
  const chartData = useMemo(() => {
    // Hilangkan leading nol
    let start = 0;
    while (start < data.length - 1 && !data[start].cumulative) start++;
    return data.slice(start).map((d) => ({
      ...d,
      cumulative: Number(d.cumulative) || 0,
      monthly: Number(d.monthly) || 0,
    }));
  }, [data]);

  /* Hitung domain Y sedikit lebih lebar dari max agar label tidak terpotong */
  const maxVal = useMemo(
    () => Math.max(0, ...chartData.map((d) => d.cumulative)),
    [chartData]
  );
  const yMax = maxVal > 0 ? Math.ceil(maxVal * 1.25) : 100;
  const yMin = 0;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 18,
        padding: "22px 24px 16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0F172A",
              fontFamily: "'Baloo 2', sans-serif",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <TrendingUp size={17} color="#2563EB" />
            Pendapatan Kumulatif Platform
          </h2>
          <p style={{ fontSize: 11, color: "#64748B", margin: "3px 0 0 0" }}>
            Akumulasi total pendapatan platform sejak awal
          </p>
        </div>

        {hasData && (
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#2563EB",
                fontFamily: "'Baloo 2', sans-serif",
                margin: 0,
              }}
            >
              {fmtFull(maxVal)}
            </p>
            <p style={{ fontSize: 10, color: "#94A3B8", margin: "2px 0 0" }}>
              Total kumulatif
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      {!hasData ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{ top: 28, right: 16, left: 8, bottom: 8 }}
          >
            {/* Grid horizontal saja, dashed tipis */}
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#E2E8F0"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{
                fill: "#94A3B8",
                fontSize: 11,
                fontFamily: "'Inter', sans-serif",
              }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
              interval={0}
              tickMargin={8}
            />

            <YAxis
              tickFormatter={fmtYAxis}
              tick={{
                fill: "#94A3B8",
                fontSize: 11,
                fontFamily: "'Inter', sans-serif",
              }}
              axisLine={false}
              tickLine={false}
              width={56}
              domain={[yMin, yMax]}
              tickCount={6}
            />

            <Tooltip content={<ChartTooltip />} />

            {/* Garis nol */}
            <ReferenceLine y={0} stroke="#E2E8F0" strokeWidth={1} />

            {/* Line kumulatif */}
            <Line
              type="linear"
              dataKey="cumulative"
              stroke="#7BBCEF"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, value, key } = props;
                return (
                  <TriangleDot
                    key={key || `dot-${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    value={value}
                  />
                );
              }}
              activeDot={{
                r: 6,
                fill: "#2563EB",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              label={(props) => (
                <ValueLabel
                  key={`lbl-${props.index}`}
                  {...props}
                  data={chartData}
                />
              )}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      {hasData && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginTop: 8,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "#64748B",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Segitiga kecil sebagai legend icon */}
            <svg width="10" height="10" viewBox="0 0 10 10">
              <polygon points="5,0 0,10 10,10" fill="#7BBCEF" stroke="#5A9FD4" strokeWidth="1" />
            </svg>
            Pendapatan Kumulatif
          </span>
        </div>
      )}
    </div>
  );
}
