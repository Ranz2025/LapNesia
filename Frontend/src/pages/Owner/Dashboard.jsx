import { useEffect, useState, useCallback } from "react";
import {
  Users, ShoppingCart, TrendingUp, Wallet, Wrench,
  Store, UserCheck, BarChart3, Sparkles, Zap, AlertCircle, RefreshCw,
} from "lucide-react";
import { getOwnerDashboard }  from "../../services/ownerService";
import { CardSkeleton }        from "../../components/ui/Skeleton";
import DashboardTopBar          from "../../components/layout/DashboardTopBar";
import RevenueChart             from "../../components/owner/RevenueChart";
import UserGrowthChart          from "../../components/owner/UserGrowthChart";

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";
const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";
const SECTION_X     = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

const fmtCompact = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR",
    notation: "compact", maximumFractionDigits: 1,
  }).format(n || 0);

const ICON_BG = {
  blue:   { background: "rgba(37,99,235,0.12)",  color: "#2563EB" },
  purple: { background: "rgba(147,51,234,0.12)", color: "#9333EA" },
  green:  { background: "rgba(16,185,129,0.12)", color: "#059669" },
  orange: { background: "rgba(245,158,11,0.12)", color: "#D97706" },
  cyan:   { background: "rgba(8,145,178,0.12)",  color: "#0891B2" },
};

const STAT_PERIODS = [
  { value: "weekly",  label: "Minggu Ini" },
  { value: "monthly", label: "Bulan Ini"  },
  { value: "yearly",  label: "Tahun Ini"  },
];

/* ─── SUB-COMPONENTS ─────────────────────────────────────────── */
function StatCard({ icon, label, value, color = "blue" }) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1"
      style={{ background: "#FFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = CLR_BORDER; e.currentTarget.style.boxShadow = "0 16px 32px -12px rgba(37,99,235,0.18)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
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

function SummaryCard({ icon, label, value, color }) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
      style={{ background: "#FFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = CLR_BORDER; e.currentTarget.style.boxShadow = "0 16px 32px -12px rgba(37,99,235,0.18)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={ICON_BG[color]}>{icon}</span>
        <p className="text-[11px]" style={{ color: CLR_MUTED }}>{label}</p>
      </div>
      <p className="text-2xl font-bold" style={{ fontFamily: FONT_DISPLAY, color: ICON_BG[color].color }}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function OwnerDashboard() {
  const [period, setPeriod]           = useState("monthly");
  const [data, setData]               = useState(null);
  // Chart data: masing-masing { weekly, monthly, yearly }
  const [revenueData, setRevenueData] = useState({ weekly: [], monthly: [], yearly: [] });
  const [userGrowthData, setUserGrowthData] = useState({ weekly: [], monthly: [], yearly: [] });
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  /* ── Fetch stats satu periode ─────────────────────────────── */
  const loadStats = useCallback(async (p) => {
    setError("");
    try {
      const res = await getOwnerDashboard(p);
      setData({ ...res.data, _ts: Date.now() });
      setLastUpdated(new Date());
    } catch {
      setError("Gagal memuat data dashboard.");
    }
  }, []);

  /* ── Fetch chart data semua 3 periode sekaligus ─────────── */
  const loadCharts = useCallback(async () => {
    try {
      const [w, m, y] = await Promise.all([
        getOwnerDashboard("weekly"),
        getOwnerDashboard("monthly"),
        getOwnerDashboard("yearly"),
      ]);
      setRevenueData({
        weekly:  w.data?.charts?.revenue     ?? [],
        monthly: m.data?.charts?.revenue     ?? [],
        yearly:  y.data?.charts?.revenue     ?? [],
      });
      setUserGrowthData({
        weekly:  w.data?.charts?.user_growth ?? [],
        monthly: m.data?.charts?.user_growth ?? [],
        yearly:  y.data?.charts?.user_growth ?? [],
      });
    } catch {
      // silent — grafik kosong
    }
  }, []);

  /* ── Initial load ─────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    Promise.all([loadStats(period), loadCharts()])
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Ganti period summary ─────────────────────────────────── */
  const handlePeriodChange = (p) => {
    setPeriod(p);
    loadStats(p);
  };

  /* ── Manual refresh ──────────────────────────────────────── */
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(period), loadCharts()]);
    setRefreshing(false);
  };

  /* ── Derived ───────────────────────────────────────────────── */
  const s = data?.stats;
  const lastTime = lastUpdated
    ? lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : null;

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: FONT_BODY, background: "#F8FAFC", minHeight: "100vh" }}>
      <DashboardTopBar />

      {/* bg glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <main className={`${SECTION_X} pt-8 pb-14`}>

        {/* ══ HERO ══ */}
        <div className="rounded-3xl overflow-hidden relative mb-7"
          style={{ background: GRAD_PRIMARY, boxShadow: "0 16px 40px -16px rgba(37,99,235,0.45)" }}>
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#FFF" }} />
          <div className="absolute -bottom-14 -left-10 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#FFF" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 px-6 sm:px-10 py-8 sm:py-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-3"
                style={{ color: "#FFF", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)" }}>
                <Zap size={11} /> Panel Owner
              </span>
              <h1 className="text-2xl sm:text-3xl leading-tight" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }}>
                <span className="text-white">Dashboard </span>
                <span style={{ color: "#67E8F9" }}>Owner</span>
              </h1>
              <p className="text-sm mt-2 max-w-md" style={{ color: "rgba(255,255,255,0.85)" }}>
                Pantau performa bisnis LAPNESIA secara menyeluruh.
              </p>
              {lastTime && (
                <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.60)" }}>
                  Terakhir diperbarui pukul {lastTime}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Period toggle untuk summary cards */}
              <div className="flex items-center gap-1 p-1 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                {STAT_PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => handlePeriodChange(p.value)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition"
                    style={{
                      background: period === p.value ? "rgba(255,255,255,0.25)" : "transparent",
                      color: "#FFF",
                      fontFamily: FONT_DISPLAY,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Tombol refresh manual */}
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="flex items-center justify-center w-10 h-10 rounded-2xl transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", color: "#FFF" }}
                title="Refresh data"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* ══ ERROR ══ */}
        {error && (
          <div className="rounded-2xl p-4 mb-6 flex items-center justify-between gap-3"
            style={{ background: "#FFF", border: "1px solid #FECACA" }}>
            <span className="flex items-center gap-2.5 text-sm" style={{ color: "#DC2626" }}>
              <AlertCircle size={16} className="flex-shrink-0" /> {error}
            </span>
            <button onClick={handleRefresh}
              className="text-sm font-semibold px-4 py-1.5 rounded-xl"
              style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}>
              Coba Lagi
            </button>
          </div>
        )}

        {/* ══ SKELETON ══ */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : s ? (
          <>
            {/* ── EKOSISTEM PENGGUNA ── */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} style={{ color: CLR_ACCENT }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>
                Ekosistem Pengguna
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
              <StatCard icon={<Users size={20} />}     label="Total Pengguna" value={s.total_users?.toLocaleString("id-ID")}       color="blue" />
              <StatCard icon={<Store size={20} />}     label="Total Penjual"  value={s.total_sellers?.toLocaleString("id-ID")}     color="purple" />
              <StatCard icon={<UserCheck size={20} />} label="Total Pembeli"  value={s.total_buyers?.toLocaleString("id-ID")}      color="green" />
              <StatCard icon={<Wrench size={20} />}    label="Total Teknisi"  value={s.total_technicians?.toLocaleString("id-ID")} color="orange" />
            </div>

            {/* ── PERFORMA BISNIS ── */}
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={14} style={{ color: CLR_ACCENT }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>
                Performa Bisnis
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
              <StatCard icon={<ShoppingCart size={20} />} label="Total Order"        value={s.total_orders?.toLocaleString("id-ID")} color="cyan" />
              <StatCard icon={<TrendingUp size={20} />}  label="Pendapatan Platform" value={fmtCompact(s.total_revenue)}             color="green" />
              <StatCard icon={<Wallet size={20} />}      label="Total Saldo Wallet"  value={fmtCompact(s.total_wallet_balance)}      color="purple" />
            </div>

            {/* ── GRAFIK PENDAPATAN ── */}
            <div className="mb-7">
              <RevenueChart
                key={`rev-${data._ts}`}
                data={revenueData}
                defaultPeriod="monthly"
              />
            </div>

            {/* ── GRAFIK PERTUMBUHAN PENGGUNA ── */}
            <div className="mb-7">
              <UserGrowthChart
                key={`ug-${data._ts}`}
                data={userGrowthData}
                defaultPeriod="monthly"
              />
            </div>

            {/* ── RINGKASAN PERIODE ── */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} style={{ color: CLR_ACCENT }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>
                Ringkasan {STAT_PERIODS.find((p) => p.value === period)?.label}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryCard icon={<Users size={15} />}        label="Pengguna Baru"       value={s.new_users_period?.toLocaleString("id-ID")} color="blue" />
              <SummaryCard icon={<ShoppingCart size={15} />} label="Order Periode Ini"   value={s.period_orders?.toLocaleString("id-ID")}   color="green" />
              <SummaryCard icon={<TrendingUp size={15} />}   label="Revenue Periode Ini" value={fmtCompact(s.period_revenue)}               color="purple" />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}