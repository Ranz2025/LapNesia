import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Wallet, ShoppingCart, Plus, RefreshCw, Star,
  Sparkles, ArrowUpRight, ShieldCheck,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import api from "../../services/api";

/* ─── DESIGN TOKENS (shared across all pages) ─────────────── */
const FONT_DISPLAY  = "'Baloo 2', sans-serif";
const FONT_BODY     = "'Inter', sans-serif";
const GRAD_PRIMARY  = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG  = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

/* ─── Reusable gradient stamp (lulus cek) ─── */
function GradientStamp({ size = 56 }) {
  return (
    <div style={{ width: size, height: size, transform: "rotate(-10deg)" }} className="relative flex-shrink-0 select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="sdStampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="url(#sdStampGrad)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#sdStampGrad)" strokeWidth="1" strokeDasharray="2 3" />
        <path d="M35 52 L46 63 L67 40" fill="none" stroke="url(#sdStampGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="78" textAnchor="middle" fontSize="6.5" fill="#0EA5E9" fontWeight="700" letterSpacing="0.5">
          LULUS CEK
        </text>
      </svg>
    </div>
  );
}

function SectionLabel({ icon, text, color = CLR_ACCENT, bg = "rgba(37,99,235,0.08)", border = "rgba(37,99,235,0.20)" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {icon} {text}
    </span>
  );
}

/* ─── Stat card ─── */
function StatCard({ icon: Icon, label, value, sub, accent = CLR_ACCENT, accentBg = "rgba(37,99,235,0.10)" }) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden transition-all duration-200 cursor-default"
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 12px 28px -10px ${accent}40`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"; }}
    >
      <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full pointer-events-none" style={{ background: accent, opacity: 0.08 }} />
      <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ background: accentBg }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: CLR_MUTED }}>{label}</p>
      <p
        className="text-2xl leading-none mb-1"
        style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] font-medium" style={{ color: accent }}>{sub}</p>}
    </div>
  );
}

/* ─── Progress row ─── */
function ProgressRow({ label, current, total, pctOverride }) {
  const pct = pctOverride ?? (total > 0 ? Math.round((current / total) * 100) : 0);
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[12px]" style={{ color: CLR_MUTED }}>{label}</span>
        <span className="text-[12px] font-semibold" style={{ color: CLR_TEXT }}>
          {pctOverride != null ? `${pctOverride}%` : `${current} / ${total}`}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#EFF6FF" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: GRAD_PRIMARY }} />
      </div>
    </div>
  );
}

/* ─── Quick-action card ─── */
function QuickCard({ icon: Icon, label, sub, accent, accentBg, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-2xl p-4 text-left w-full transition-all duration-200"
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 12px 28px -10px ${accent}40`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ background: accentBg }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-none mb-1" style={{ color: CLR_TEXT }}>{label}</p>
        {sub && <p className="text-[11px] truncate" style={{ color: CLR_SUBTLE }}>{sub}</p>}
      </div>
      <ArrowUpRight
        size={15}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: accent }}
      />
    </button>
  );
}

/* ─── Main component ─── */
export default function SellerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    balance: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    rating: 4.9,
  });
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);

    const [walletRes, ordersRes, productsRes] = await Promise.allSettled([
      api.get("/v1/wallet"),
      api.get("/v1/orders"),
      api.get("/v1/seller/products"),
    ]);

    const walletData = walletRes.status === "fulfilled"
      ? (walletRes.value.data?.data ?? walletRes.value.data ?? {})
      : {};

    const ordersPayload = ordersRes.status === "fulfilled" ? ordersRes.value.data : null;
    let orders = [];
    if (ordersPayload) {
      const inner = ordersPayload?.data ?? ordersPayload;
      orders = Array.isArray(inner?.data) ? inner.data : Array.isArray(inner) ? inner : [];
    }

    const productsPayload = productsRes.status === "fulfilled" ? productsRes.value.data : null;
    let products = [];
    if (productsPayload) {
      const inner = productsPayload?.data ?? productsPayload;
      products = Array.isArray(inner?.data) ? inner.data : Array.isArray(inner) ? inner : [];
    }

    if (
      walletRes.status === "rejected" ||
      ordersRes.status === "rejected" ||
      productsRes.status === "rejected"
    ) {
      toast.error("Sebagian data dashboard gagal dimuat.");
    }

    setStats({
      balance: Number(walletData.available_balance || 0),
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.status === "active").length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "waiting_payment").length,
      completedOrders: orders.filter((o) => o.status === "completed").length,
      rating: 4.9,
    });

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      <Navbar />

      {/* ══════════════ AMBIENT GLOW BACKDROP ══════════════ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>


      <main className={`${SECTION_X} py-8`}>

        {/* ── Hero greeting ── */}
        <div
          className="rounded-3xl overflow-hidden relative px-6 sm:px-10 py-8 sm:py-10 mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          style={{ background: GRAD_PRIMARY, boxShadow: "0 16px 40px -16px rgba(37,99,235,0.45)" }}
        >
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />

          <div className="relative">
            <div className="mb-2">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold"
                style={{ color: "#FFFFFF", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)" }}
              >
                <Sparkles size={11} /> Panel Seller
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl leading-tight mb-1" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }}>
              <span className="text-white">Dashboard </span>
              <span style={{ color: "#67E8F9" }}>Seller</span>
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
              Pantau toko dan kelola penjualanmu di satu tempat.
            </p>
          </div>

          <div className="relative flex gap-2 flex-shrink-0">
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition"
              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", color: "#FFFFFF" }}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Memperbarui..." : "Refresh"}
            </button>
            <button
              onClick={() => navigate("/seller/add-product")}
              className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition hover:brightness-110 active:scale-95"
              style={{ background: "#FFFFFF", color: CLR_ACCENT, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
            >
              <Plus size={15} /> Tambah Produk
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
              <StatCard
                icon={Wallet}
                label="Saldo Tersedia"
                value={`Rp ${stats.balance.toLocaleString("id-ID")}`}
                sub="Siap dicairkan"
                accent="#2563EB"
                accentBg="rgba(37,99,235,0.10)"
              />
              <StatCard
                icon={Package}
                label="Total Produk"
                value={stats.totalProducts}
                sub={`${stats.activeProducts} aktif`}
                accent="#059669"
                accentBg="rgba(5,150,105,0.10)"
              />
              <StatCard
                icon={ShoppingCart}
                label="Total Order"
                value={stats.totalOrders}
                sub={stats.pendingOrders > 0 ? `${stats.pendingOrders} menunggu pembayaran` : "Semua terproses"}
                accent="#D97706"
                accentBg="rgba(217,119,6,0.10)"
              />
              <StatCard
                icon={Star}
                label="Rating Toko"
                value={stats.rating}
                sub="Top Seller"
                accent="#0891B2"
                accentBg="rgba(8,145,178,0.10)"
              />
            </div>

            {/* ── Performance panel ── */}
            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}
            >
              <div className="flex items-center justify-between mb-6 pb-5 flex-wrap gap-3" style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}>
                <div>
                  <SectionLabel icon={<ShieldCheck size={11} />} text="Ringkasan Toko" />
                  <h2 className="text-base mt-2.5" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
                    Performa Bulan Ini
                  </h2>
                </div>
                <GradientStamp size={48} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <ProgressRow label="Produk aktif" current={stats.activeProducts} total={stats.totalProducts} />
                <ProgressRow label="Order selesai" current={stats.completedOrders} total={stats.totalOrders} />
                <ProgressRow label="Unit lulus inspeksi" current={stats.activeProducts} total={stats.totalProducts} />
                <ProgressRow label="Kepuasan pembeli" pctOverride={98} />
              </div>
            </div>

            {/* ── Quick actions ── */}
            <div>
              <div className="mb-4">
                <SectionLabel icon={<Sparkles size={11} />} text="Akses Cepat" />
                <h2 className="text-base mt-2.5" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
                  Menu Cepat
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <QuickCard
                  icon={Package}
                  label="Produk Saya"
                  sub={`${stats.totalProducts} produk terdaftar`}
                  accent="#2563EB"
                  accentBg="rgba(37,99,235,0.10)"
                  onClick={() => navigate("/seller/products")}
                />
                <QuickCard
                  icon={ShoppingCart}
                  label="Pesanan"
                  sub={stats.pendingOrders > 0 ? `${stats.pendingOrders} perlu aksi` : "Semua beres"}
                  accent="#D97706"
                  accentBg="rgba(217,119,6,0.10)"
                  onClick={() => navigate("/seller/orders")}
                />
                <QuickCard
                  icon={Wallet}
                  label="Saldo & Withdraw"
                  sub={`Rp ${stats.balance.toLocaleString("id-ID")} tersedia`}
                  accent="#059669"
                  accentBg="rgba(5,150,105,0.10)"
                  onClick={() => navigate("/seller/wallet")}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}