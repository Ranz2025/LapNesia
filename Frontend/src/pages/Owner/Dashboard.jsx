import { useEffect, useState } from "react";
import {
  Users, ShoppingCart, TrendingUp, Wallet, ArrowDownCircle, Wrench,
  Store, UserCheck, BarChart3, Sparkles, Zap, AlertCircle, RefreshCw
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getOwnerDashboard } from "../../services/ownerService";
import { CardSkeleton } from "../../components/ui/Skeleton";

/* ─── DESIGN TOKENS (selaras dengan halaman lain) ──────────────── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
const fmtCompact = (n) => new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);

const ICON_BG = {
  blue:   { background: "rgba(37,99,235,0.12)",  color: "#2563EB" },
  purple: { background: "rgba(147,51,234,0.12)", color: "#9333EA" },
  green:  { background: "rgba(16,185,129,0.12)", color: "#059669" },
  orange: { background: "rgba(245,158,11,0.12)", color: "#D97706" },
  cyan:   { background: "rgba(8,145,178,0.12)",  color: "#0891B2" },
};

const PERIODS = [
  { value: "weekly",  label: "Minggu Ini" },
  { value: "monthly", label: "Bulan Ini" },
  { value: "yearly",  label: "Tahun Ini" },
];

/* ─── SECTION LABEL ─────────────────────────────────────────────── */
function SectionLabel({ icon, text }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-3"
      style={{ color: CLR_ACCENT, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)" }}
    >
      {icon} {text}
    </span>
  );
}

/* ─── STAT CARD ─────────────────────────────────────────────────── */
function StatCard({ icon, label, value, color = "blue" }) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1"
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={ICON_BG[color]}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] truncate" style={{ color: CLR_MUTED }}>{label}</p>
        <p className="text-lg font-bold truncate" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── MINI SUMMARY CARD ─────────────────────────────────────────── */
function SummaryCard({ icon, label, value, color }) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={ICON_BG[color]}>
          {icon}
        </span>
        <p className="text-[11px]" style={{ color: CLR_MUTED }}>{label}</p>
      </div>
      <p className="text-2xl font-bold" style={{ fontFamily: FONT_DISPLAY, color: ICON_BG[color].color }}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (p) => {
    setLoading(true);
    setError("");
    try {
      const res = await getOwnerDashboard(p);
      setData(res.data);
    } catch {
      setError("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(period); }, [period]);

  const s = data?.stats;
  const maxVal = data?.charts?.revenue?.length ? Math.max(...data.charts.revenue.map((r) => r.revenue), 1) : 1;

  return (
    <div style={{ fontFamily: FONT_BODY, background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />

      {/* Ambient glow backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <main className={`${SECTION_X} pt-8 pb-14`}>

        {/* ══════════════ HERO HEADER ══════════════ */}
        <div
          className="rounded-3xl overflow-hidden relative mb-7"
          style={{ background: GRAD_HERO_BG, border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#06B6D4" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 px-6 sm:px-10 py-8 sm:py-10">
            <div>
              <SectionLabel icon={<Zap size={11} />} text="Panel Owner" />
              <h1
                className="text-2xl sm:text-3xl leading-tight"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}
              >
                Dashboard{" "}
                <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  Owner
                </span>
              </h1>
              <p className="text-sm mt-2 max-w-md" style={{ color: CLR_MUTED }}>
                Pantau performa bisnis LAPNESIA secara menyeluruh.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className="flex items-center gap-1 p-1 rounded-2xl"
                style={{ background: "#FFFFFF", border: `1.5px solid ${CLR_BORDER}` }}
              >
                {PERIODS.map((p) => {
                  const active = period === p.value;
                  return (
                    <button
                      key={p.value}
                      onClick={() => setPeriod(p.value)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold transition"
                      style={{
                        background: active ? GRAD_PRIMARY : "transparent",
                        color: active ? "#0F172A" : CLR_MUTED,
                        fontFamily: FONT_DISPLAY,
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => load(period)}
                disabled={loading}
                className="flex items-center justify-center w-10 h-10 rounded-2xl transition hover:brightness-105 active:scale-95 disabled:opacity-60 flex-shrink-0"
                style={{ background: "#FFFFFF", border: `1.5px solid ${CLR_BORDER}`, color: CLR_ACCENT }}
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="rounded-2xl p-4 mb-6 flex items-center justify-between gap-3"
            style={{ background: "#FFFFFF", border: "1px solid #FECACA" }}
          >
            <span className="flex items-center gap-2.5 text-sm" style={{ color: "#DC2626" }}>
              <AlertCircle size={16} className="flex-shrink-0" /> {error}
            </span>
            <button
              onClick={() => load(period)}
              className="text-sm font-semibold flex-shrink-0 px-4 py-1.5 rounded-xl transition"
              style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : s ? (
          <>
            {/* ══════════════ EKOSISTEM PENGGUNA ══════════════ */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} style={{ color: CLR_ACCENT }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>Ekosistem Pengguna</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
              <StatCard icon={<Users size={20} />} label="Total Pengguna" value={s.total_users?.toLocaleString("id-ID")} color="blue" />
              <StatCard icon={<Store size={20} />} label="Total Penjual" value={s.total_sellers?.toLocaleString("id-ID")} color="purple" />
              <StatCard icon={<UserCheck size={20} />} label="Total Pembeli" value={s.total_buyers?.toLocaleString("id-ID")} color="green" />
              <StatCard icon={<Wrench size={20} />} label="Total Teknisi" value={s.total_technicians?.toLocaleString("id-ID")} color="orange" />
            </div>

            {/* ══════════════ PERFORMA BISNIS ══════════════ */}
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={14} style={{ color: CLR_ACCENT }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>Performa Bisnis</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
              <StatCard icon={<ShoppingCart size={20} />} label="Total Order" value={s.total_orders?.toLocaleString("id-ID")} color="blue" />
              <StatCard icon={<TrendingUp size={20} />} label="Pendapatan Platform" value={fmtCompact(s.total_revenue)} color="green" />
              <StatCard icon={<Wallet size={20} />} label="Total Saldo Wallet" value={fmtCompact(s.total_wallet_balance)} color="purple" />
              <StatCard icon={<ArrowDownCircle size={20} />} label="Withdrawal Pending" value={fmtCompact(s.pending_withdrawals)} color="orange" />
            </div>

            {/* ══════════════ CHART REVENUE ══════════════ */}
            <div
              className="rounded-2xl p-6 sm:p-7 mb-7"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>
                  <TrendingUp size={17} style={{ color: CLR_ACCENT }} /> Pendapatan 12 Bulan Terakhir
                </h2>
              </div>

              {!data.charts.revenue || data.charts.revenue.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm" style={{ color: CLR_SUBTLE }}>Belum ada data pendapatan.</p>
                </div>
              ) : (
                <div className="flex items-end gap-3 h-44 overflow-x-auto pb-1">
                  {data.charts.revenue.map((item) => {
                    const h = Math.max(4, (item.revenue / maxVal) * 100);
                    return (
                      <div key={item.month} className="flex flex-col items-center gap-2 min-w-[44px] flex-1 group">
                        <span
                          className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: CLR_ACCENT }}
                        >
                          {fmtCompact(item.revenue)}
                        </span>
                        <div
                          className="rounded-t-lg w-full transition-all duration-300 group-hover:brightness-110"
                          style={{ height: `${h}%`, background: GRAD_PRIMARY, minHeight: 4 }}
                          title={`${item.month}: ${fmt(item.revenue)}`}
                        />
                        <span className="text-[10px]" style={{ color: CLR_SUBTLE }}>{item.month.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ══════════════ RINGKASAN PERIODE ══════════════ */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} style={{ color: CLR_ACCENT }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>
                Ringkasan {PERIODS.find(p => p.value === period)?.label}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryCard icon={<Users size={15} />} label="Pengguna Baru" value={s.new_users_period?.toLocaleString("id-ID")} color="blue" />
              <SummaryCard icon={<ShoppingCart size={15} />} label="Order Periode Ini" value={s.period_orders?.toLocaleString("id-ID")} color="green" />
              <SummaryCard icon={<TrendingUp size={15} />} label="Revenue Periode Ini" value={fmtCompact(s.period_revenue)} color="purple" />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}