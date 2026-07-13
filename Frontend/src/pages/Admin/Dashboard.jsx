import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Package, ShoppingCart, Wallet, AlertCircle,
  CheckCircle, RefreshCw, Wrench, ChevronRight,
  Sparkles, ShieldCheck, Zap
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import { getAdminDashboard } from "../../services/profileService";

/* ─── DESIGN TOKENS (selaras dengan Owner Dashboard) ──── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY  = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG  = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

const unwrap = (payload) => {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return data?.data ?? data ?? [];
};

const ICON_BG = {
  blue:   { background: "rgba(37,99,235,0.12)",  color: "#2563EB" },
  green:  { background: "rgba(16,185,129,0.12)", color: "#059669" },
  purple: { background: "rgba(147,51,234,0.12)", color: "#9333EA" },
  orange: { background: "rgba(245,158,11,0.12)", color: "#D97706" },
  red:    { background: "rgba(220,38,38,0.12)",  color: "#DC2626" },
  cyan:   { background: "rgba(8,145,178,0.12)",  color: "#0891B2" },
};

/* ─── Section Label (sama seperti Owner) ─── */
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

function QuickAction({ icon, color, label, badge, badgeColor = "red", onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-2xl p-4 flex items-center gap-3 text-left transition-all duration-300 hover:-translate-y-1 group overflow-hidden w-full"
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = CLR_BORDER; e.currentTarget.style.boxShadow = "0 16px 32px -12px rgba(37,99,235,0.18)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={ICON_BG[color]}>
        {icon}
      </div>
      <span className="font-semibold text-sm flex-1" style={{ color: CLR_TEXT }}>{label}</span>
      {badge > 0 ? (
        <span
          className="text-[11px] font-bold rounded-full px-2 py-0.5 flex-shrink-0"
          style={ICON_BG[badgeColor]}
        >
          {badge}
        </span>
      ) : (
        <ChevronRight size={16} className="flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: CLR_SUBTLE }} />
      )}
    </button>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboard();
      setData(unwrap(res));
    } catch (err) {
      setError("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const s = data?.stats;

  return (
    <div style={{ fontFamily: FONT_BODY, background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Ambient glow backdrop, selaras dengan Owner.jsx */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <Navbar />

      <main className={`${SECTION_X} pt-8 pb-14`}>

        {/* ══════════ Hero Header ══════════ */}
        <div
          className="rounded-3xl overflow-hidden relative mb-7"
          style={{ background: GRAD_PRIMARY, boxShadow: "0 16px 40px -16px rgba(37,99,235,0.45)" }}
        >
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />
          <div className="absolute -bottom-14 -left-10 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 px-6 sm:px-10 py-8 sm:py-10">
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-3"
                style={{ color: "#FFFFFF", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)" }}
              >
                <Zap size={11} /> Panel Admin
              </span>
              <h1 className="text-2xl sm:text-3xl leading-tight" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }}>
                <span className="text-white">Dashboard </span>
                <span style={{ color: "#67E8F9" }}>Admin</span>
              </h1>
              <p className="text-sm mt-2 max-w-md" style={{ color: "rgba(255,255,255,0.85)" }}>
                Kelola platform dan monitor aktivitas secara real-time.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {s?.pending_technicians > 0 ? (
                <span
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.25)" }}
                >
                  <AlertCircle size={13} /> {s.pending_technicians} perlu tindakan
                </span>
              ) : (
                <span
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.25)" }}
                >
                  <ShieldCheck size={13} /> Semua aman
                </span>
              )}
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                style={{ background: "rgba(255,255,255,0.18)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.30)", fontFamily: FONT_DISPLAY }}
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="rounded-2xl p-4 mb-6 flex items-center justify-between"
            style={{ background: "#FFFFFF", border: "1px solid #FECACA" }}
          >
            <p className="text-sm font-medium" style={{ color: "#DC2626" }}>
              {error}
            </p>
            <button onClick={fetchData} className="text-sm font-semibold underline transition" style={{ color: "#DC2626" }}>
              Coba lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : s ? (
          <>
            {/* ══════════ Ekosistem Pengguna ══════════ */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} style={{ color: CLR_ACCENT }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>Ekosistem Pengguna</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
              <StatCard icon={<Users size={20} style={ICON_BG.blue} />} label="Total Pengguna" value={s.total_users} color="blue" />
              <StatCard icon={<Users size={20} style={ICON_BG.purple} />} label="Total Penjual" value={s.total_sellers} color="purple" />
              <StatCard icon={<Users size={20} style={ICON_BG.green} />} label="Total Pembeli" value={s.total_buyers} color="green" />
              <StatCard icon={<Wrench size={20} style={ICON_BG.orange} />} label="Total Teknisi" value={s.total_technicians} color="orange" />
            </div>

            {/* ══════════ Performa Platform ══════════ */}
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={14} style={{ color: CLR_ACCENT }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>Performa Platform</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              <StatCard icon={<Package size={20} style={ICON_BG.cyan} />} label="Total Produk" value={s.total_products} color="cyan" />
              <StatCard icon={<ShoppingCart size={20} style={ICON_BG.green} />} label="Total Order" value={s.total_orders} color="green" />
              <StatCard icon={<AlertCircle size={20} style={ICON_BG.red} />} label="Teknisi Pending" value={s.pending_technicians} color="red" />
            </div>

            {/* ══════════ Quick Actions ══════════ */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} style={{ color: CLR_ACCENT }} />
                <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>Aksi Cepat</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <QuickAction
                  icon={<Wrench size={18} style={ICON_BG.orange} />}
                  color="orange"
                  label="Verifikasi Teknisi"
                  badge={s.pending_technicians}
                  badgeColor="red"
                  onClick={() => navigate("/admin/technicians")}
                />
                <QuickAction
                  icon={<Users size={18} style={ICON_BG.purple} />}
                  color="purple"
                  label="Kelola Pengguna"
                  badge={0}
                  onClick={() => navigate("/admin/users")}
                />
                <QuickAction
                  icon={<Package size={18} style={ICON_BG.green} />}
                  color="green"
                  label="Lihat Produk"
                  badge={0}
                />
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}