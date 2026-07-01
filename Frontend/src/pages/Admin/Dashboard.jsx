import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Package, ShoppingCart, TrendingUp, Wallet, AlertCircle,
  CheckCircle, Clock, X, RefreshCw, Wrench, ChevronRight,
  Sparkles, ShieldCheck
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import { getAdminDashboard, approveWithdrawal, rejectWithdrawal } from "../../services/profileService";

/* ─── DESIGN TOKENS (selaras dengan Home.jsx / Footer.jsx) ──── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#64748B";
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

const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

const ICON_BG = {
  blue:   { background: "rgba(37,99,235,0.10)",  color: "#2563EB" },
  green:  { background: "rgba(16,185,129,0.10)", color: "#10B981" },
  purple: { background: "rgba(147,51,234,0.10)", color: "#9333EA" },
  orange: { background: "rgba(234,88,12,0.10)",  color: "#EA580C" },
  red:    { background: "rgba(220,38,38,0.10)",  color: "#DC2626" },
  cyan:   { background: "rgba(8,145,178,0.10)",  color: "#0891B2" },
};

/* Gradient vivid untuk icon stat card (icon putih di atas gradient warna) */
const ICON_GRAD = {
  blue:   "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
  green:  "linear-gradient(135deg, #34D399 0%, #059669 100%)",
  purple: "linear-gradient(135deg, #C084FC 0%, #9333EA 100%)",
  orange: "linear-gradient(135deg, #FB923C 0%, #EA580C 100%)",
  red:    "linear-gradient(135deg, #F87171 0%, #DC2626 100%)",
  cyan:   "linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)",
};
const ICON_SHADOW = {
  blue: "0 8px 20px -6px rgba(37,99,235,0.5)",
  green: "0 8px 20px -6px rgba(5,150,105,0.5)",
  purple: "0 8px 20px -6px rgba(147,51,234,0.5)",
  orange: "0 8px 20px -6px rgba(234,88,12,0.5)",
  red: "0 8px 20px -6px rgba(220,38,38,0.5)",
  cyan: "0 8px 20px -6px rgba(8,145,178,0.5)",
};

const STATUS_STYLE = {
  pending:   { bg: "rgba(234,88,12,0.10)",  fg: "#EA580C", icon: <Clock size={12} /> },
  processed: { bg: "rgba(16,185,129,0.10)", fg: "#10B981", icon: <CheckCircle size={12} /> },
  approved:  { bg: "rgba(16,185,129,0.10)", fg: "#10B981", icon: <CheckCircle size={12} /> },
  rejected:  { bg: "rgba(220,38,38,0.10)",  fg: "#DC2626", icon: <X size={12} /> },
};

function StatCard({ icon, label, value, color = "blue", highlight = false }) {
  return (
    <div
      className="relative rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden group"
      style={{
        background: highlight ? GRAD_PRIMARY : "#FFFFFF",
        border: highlight ? "none" : `1px solid ${CLR_BORDER_LT}`,
        boxShadow: highlight ? "0 12px 30px -10px rgba(37,99,235,0.45)" : "0 2px 10px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => { if (!highlight) e.currentTarget.style.boxShadow = "0 16px 32px -12px rgba(37,99,235,0.18)"; }}
      onMouseLeave={(e) => { if (!highlight) e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
    >
      {!highlight && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
          style={{ background: ICON_GRAD[color] }}
        />
      )}
      <div
        className="p-3 rounded-xl flex-shrink-0 text-white"
        style={{ background: highlight ? "rgba(255,255,255,0.18)" : ICON_GRAD[color], boxShadow: highlight ? "none" : ICON_SHADOW[color] }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs truncate mb-0.5" style={{ color: highlight ? "rgba(255,255,255,0.85)" : CLR_SUBTLE }}>
          {label}
        </p>
        <p
          className="text-xl font-bold truncate"
          style={{ fontFamily: FONT_DISPLAY, color: highlight ? "#FFFFFF" : CLR_TEXT }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function QuickAction({ icon, color, label, badge, badgeColor = "red", onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-2xl p-4 flex items-center gap-3 text-left transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden"
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = CLR_BORDER; e.currentTarget.style.boxShadow = "0 16px 32px -12px rgba(37,99,235,0.18)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ background: ICON_GRAD[color] }}
      />
      <div className="p-2.5 rounded-xl flex-shrink-0 text-white" style={{ background: ICON_GRAD[color], boxShadow: ICON_SHADOW[color] }}>
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
  const [actionLoading, setActionLoading] = useState(null);
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

  const handleApproveWithdrawal = async (id) => {
    setActionLoading(id);
    try {
      await approveWithdrawal(id);
      toast.success("Penarikan berhasil disetujui.");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal menyetujui penarikan.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectWithdrawal = async (id) => {
    const reason = prompt("Alasan penolakan:");
    if (!reason || reason.length < 5) {
      toast.error("Alasan minimal 5 karakter.");
      return;
    }
    setActionLoading(id);
    try {
      await rejectWithdrawal(id, reason);
      toast.success("Penarikan ditolak.");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal menolak penarikan.");
    } finally {
      setActionLoading(null);
    }
  };

  const s = data?.stats;

  return (
    <div style={{ fontFamily: FONT_BODY }} className="relative min-h-screen overflow-hidden">

      {/* Ambient glow backdrop, selaras dengan Home.jsx */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#F8FAFC" }}>
        <div className="absolute -top-32 -right-16 w-[420px] h-[420px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[50%] -left-20 w-[360px] h-[360px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <Navbar />

      <main className={`${SECTION_X} py-8`}>

        {/* ══════════ Hero Header ══════════ */}
        <div
          className="relative rounded-3xl overflow-hidden mb-8 px-6 sm:px-9 py-8"
          style={{ background: GRAD_PRIMARY, boxShadow: "0 16px 40px -16px rgba(37,99,235,0.45)" }}
        >
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />
          <div className="absolute -bottom-14 -left-10 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-3"
                style={{ color: "#FFFFFF", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)" }}
              >
                <Sparkles size={11} /> Panel Admin
              </span>
              <h1 className="text-2xl md:text-3xl mb-1.5 text-white" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }}>
                Halo, Admin 👋
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                Kelola platform dan monitor aktivitas secara real-time.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {s?.pending_technicians > 0 || s?.pending_withdrawals > 0 ? (
                <span
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.25)" }}
                >
                  <AlertCircle size={13} /> {(s?.pending_technicians || 0) + (s?.pending_withdrawals || 0)} perlu tindakan
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
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                style={{ background: "#FFFFFF", color: CLR_ACCENT, fontFamily: FONT_DISPLAY }}
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="rounded-2xl p-4 mb-6 flex items-center justify-between"
            style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.20)" }}
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
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : s ? (
          <>
            {/* ══════════ Stat cards ══════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard icon={<Users size={20} />} label="Total Pengguna" value={s.total_users} color="blue" />
              <StatCard icon={<Users size={20} />} label="Total Penjual" value={s.total_sellers} color="purple" />
              <StatCard icon={<Users size={20} />} label="Total Pembeli" value={s.total_buyers} color="green" />
              <StatCard icon={<Wrench size={20} />} label="Total Teknisi" value={s.total_technicians} color="orange" />
              <StatCard icon={<Package size={20} />} label="Total Produk" value={s.total_products} color="cyan" />
              <StatCard icon={<ShoppingCart size={20} />} label="Total Order" value={s.total_orders} color="green" />
              <StatCard icon={<TrendingUp size={20} />} label="Pendapatan Platform" value={fmt(s.total_revenue)} color="purple" highlight />
              <StatCard icon={<AlertCircle size={20} />} label="Teknisi Pending" value={s.pending_technicians} color="red" />
            </div>

            {/* ══════════ Quick Actions ══════════ */}
            <div className="mb-10">
              <h2 className="text-base font-semibold mb-4" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
                Aksi Cepat
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickAction
                  icon={<Wrench size={20} />}
                  color="orange"
                  label="Verifikasi Teknisi"
                  badge={s.pending_technicians}
                  badgeColor="red"
                  onClick={() => navigate("/admin/technicians")}
                />
                <QuickAction
                  icon={<Users size={20} />}
                  color="purple"
                  label="Kelola Pengguna"
                  badge={0}
                  onClick={() => navigate("/admin/technicians?status=all")}
                />
                <QuickAction
                  icon={<Package size={20} />}
                  color="green"
                  label="Lihat Produk"
                  badge={0}
                />
                <QuickAction
                  icon={<Wallet size={20} />}
                  color="blue"
                  label="Kelola Penarikan"
                  badge={s.pending_withdrawals}
                  badgeColor="orange"
                />
              </div>
            </div>

            {/* ══════════ Recent Withdrawals ══════════ */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
            >
              <div
                className="px-6 py-5 flex items-center justify-between gap-3"
                style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}
              >
                <div>
                  <h2 className="text-base font-semibold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
                    Penarikan Dana Terbaru
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: CLR_SUBTLE }}>Permintaan withdraw dari penjual</p>
                </div>
                {s.pending_withdrawals > 0 && (
                  <span
                    className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
                    style={{ background: "rgba(234,88,12,0.10)", color: "#EA580C" }}
                  >
                    {s.pending_withdrawals} pending
                  </span>
                )}
              </div>

              {!data.recent_withdrawals || data.recent_withdrawals.length === 0 ? (
                <div className="p-14 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(16,185,129,0.10)" }}
                  >
                    <CheckCircle className="w-7 h-7" style={{ color: "#10B981" }} />
                  </div>
                  <p className="text-sm" style={{ color: CLR_MUTED }}>
                    Tidak ada penarikan terbaru.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{ background: "#F8FAFC" }}>
                      <tr style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}>
                        {["Pengguna", "Rekening", "Jumlah", "Status", "Tanggal", "Aksi"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide" style={{ color: CLR_SUBTLE }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_withdrawals.map((w, idx) => {
                        const st = STATUS_STYLE[w.status] || STATUS_STYLE.pending;
                        return (
                          <tr
                            key={w.id}
                            className="transition-colors hover:bg-[#F8FAFC]"
                            style={{
                              borderBottom: idx === data.recent_withdrawals.length - 1 ? "none" : `1px solid ${CLR_BORDER_LT}`,
                            }}
                          >
                            <td className="px-5 py-4 font-medium" style={{ color: CLR_TEXT }}>{w.user_name}</td>
                            <td className="px-5 py-4" style={{ color: CLR_MUTED }}>
                              {w.bank_name} &middot; {w.account_number}
                            </td>
                            <td className="px-5 py-4 font-semibold" style={{ color: CLR_TEXT }}>{fmt(w.amount)}</td>
                            <td className="px-5 py-4">
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{ background: st.bg, color: st.fg }}
                              >
                                {st.icon}
                                {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-5 py-4" style={{ color: CLR_MUTED }}>
                              {new Date(w.created_at).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-5 py-4">
                              {w.status === "pending" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveWithdrawal(w.id)}
                                    disabled={actionLoading === w.id}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition hover:brightness-95 disabled:opacity-60"
                                    style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
                                  >
                                    Setujui
                                  </button>
                                  <button
                                    onClick={() => handleRejectWithdrawal(w.id)}
                                    disabled={actionLoading === w.id}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition hover:brightness-95 disabled:opacity-60"
                                    style={{ background: "rgba(220,38,38,0.12)", color: "#DC2626" }}
                                  >
                                    Tolak
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}