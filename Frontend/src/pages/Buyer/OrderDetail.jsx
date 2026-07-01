import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import RatingForm from "../../components/ui/RatingForm";
import { toast } from "../../components/ui/Toast";
import { PageLoader } from "../../components/ui/Skeleton";
import { getOrder, confirmReceived, cancelOrder } from "../../services/orderService";
import { getRatingByOrder } from "../../services/ratingService";
import { getUser } from "../../services/authService";
import { getReturn } from "../../services/returnService";
import {
  ArrowLeft, Package, CreditCard, Truck, CheckCircle2,
  Clock, RefreshCw, AlertTriangle, Star, Shield, Hash,
  User, CalendarDays, Receipt, ChevronRight, XCircle, ShoppingBag
} from "lucide-react";

/* ─── Design tokens (selaras dengan Home.jsx / AdminDashboard.jsx) ─── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#64748B";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

/* ─── Status config ─── */
const STATUS_CONFIG = {
  waiting_payment: {
    label: "Menunggu Pembayaran",
    icon: <Clock size={14} />,
    pill: { bg: "rgba(202,138,4,0.10)", text: "#CA8A04", border: "rgba(202,138,4,0.25)" },
    step: 1,
  },
  paid: {
    label: "Pembayaran Diterima",
    icon: <CreditCard size={14} />,
    pill: { bg: "rgba(37,99,235,0.10)", text: "#2563EB", border: "rgba(37,99,235,0.25)" },
    step: 2,
  },
  shipped: {
    label: "Dalam Pengiriman",
    icon: <Truck size={14} />,
    pill: { bg: "rgba(8,145,178,0.10)", text: "#0891B2", border: "rgba(8,145,178,0.25)" },
    step: 3,
  },
  completed: {
    label: "Selesai",
    icon: <CheckCircle2 size={14} />,
    pill: { bg: "rgba(16,185,129,0.10)", text: "#10B981", border: "rgba(16,185,129,0.25)" },
    step: 4,
  },
  expired: {
    label: "Kedaluwarsa",
    icon: <XCircle size={14} />,
    pill: { bg: "rgba(100,116,139,0.10)", text: "#64748B", border: "rgba(100,116,139,0.25)" },
    step: 0,
  },
  refunded: {
    label: "Dana Dikembalikan",
    icon: <RefreshCw size={14} />,
    pill: { bg: "rgba(234,88,12,0.10)", text: "#EA580C", border: "rgba(234,88,12,0.25)" },
    step: 0,
  },
  disputed: {
    label: "Dalam Sengketa",
    icon: <AlertTriangle size={14} />,
    pill: { bg: "rgba(220,38,38,0.10)", text: "#DC2626", border: "rgba(220,38,38,0.25)" },
    step: 0,
  },
};

const STEPS = [
  { key: "waiting_payment", label: "Pesanan Dibuat",  icon: <Receipt   size={14} /> },
  { key: "paid",            label: "Pembayaran",      icon: <CreditCard size={14} /> },
  { key: "shipped",         label: "Pengiriman",      icon: <Truck     size={14} /> },
  { key: "completed",       label: "Selesai",         icon: <CheckCircle2 size={14} /> },
];

/* ─── Gradient stamp (reused from Home) ─── */
function GradientStamp({ size = 56 }) {
  return (
    <div style={{ width: size, height: size, transform: "rotate(-10deg)" }} className="select-none flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#0891B2" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="url(#sg2)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#sg2)" strokeWidth="1" strokeDasharray="2 3" />
        <path d="M35 52 L46 63 L67 40" fill="none" stroke="url(#sg2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="78" textAnchor="middle" fontSize="6.5" fill="#06B6D4" fontWeight="700" letterSpacing="0.5">LULUS CEK</text>
      </svg>
    </div>
  );
}

/* ─── Status pill ─── */
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.expired;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.pill.bg, color: cfg.pill.text, border: `1px solid ${cfg.pill.border}` }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

/* ─── Progress stepper ─── */
function Stepper({ status }) {
  const cfg     = STATUS_CONFIG[status];
  const current = cfg?.step ?? 0;
  const terminal = ["expired", "refunded", "disputed"].includes(status);

  if (terminal) return null;

  return (
    <div className="flex items-center gap-0 w-full mb-1">
      {STEPS.map((s, i) => {
        const done    = i + 1 < current;
        const active  = i + 1 === current;
        const last    = i === STEPS.length - 1;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 44 }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={
                  active
                    ? { background: GRAD_PRIMARY, color: "#fff", boxShadow: "0 4px 14px -2px rgba(37,99,235,0.5)" }
                    : done
                    ? { background: "rgba(37,99,235,0.12)", color: "#2563EB", border: "1px solid rgba(37,99,235,0.3)" }
                    : { background: "#F8FAFC", color: "#94A3B8", border: `1px solid ${CLR_BORDER_LT}` }
                }
              >
                {done ? <CheckCircle2 size={15} /> : s.icon}
              </div>
              <span className="text-[10px] text-center leading-tight font-medium"
                style={{ color: active ? "#2563EB" : done ? "#475569" : "#94A3B8", maxWidth: 52 }}>
                {s.label}
              </span>
            </div>
            {/* Connector */}
            {!last && (
              <div className="flex-1 h-[2px] mx-1 mb-5 rounded-full"
                style={{ background: done ? "#2563EB" : CLR_BORDER_LT }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Info row ─── */
function InfoRow({ label, value, accent }) {
  return (
    <div className="flex justify-between items-center py-3" style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}>
      <span className="text-sm" style={{ color: CLR_SUBTLE }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: accent ? CLR_ACCENT : CLR_TEXT }}>{value}</span>
    </div>
  );
}

/* ─── Card wrapper ─── */
function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
    >
      {children}
    </div>
  );
}

/* ─── Section label ─── */
function SectionLabel({ icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(37,99,235,0.08)", color: CLR_ACCENT }}
      >
        {icon}
      </span>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: CLR_SUBTLE }}>{children}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════ */
export default function OrderDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [order,   setOrder]   = useState(null);
  const [rating,  setRating]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [acting,  setActing]  = useState(false);
  const [existingReturn, setExistingReturn] = useState(null);

  const isSeller = getUser()?.role === "seller";

  const fetchOrder = async () => {
    try {
      setLoading(true); setError(null);
      const res = await getOrder(id);
      setOrder(res.data);
      if (res.data.status === "completed") {
        try { const r = await getRatingByOrder(id); setRating(r.data); } catch {}
        // Cek apakah sudah ada return untuk order ini
        try {
          const { getReturns } = await import("../../services/returnService");
          const retRes = await getReturns();
          const inner = retRes?.data;
          const list = Array.isArray(inner?.data) ? inner.data
                     : Array.isArray(inner) ? inner : [];
          const found = list.find((r) => r.order_id === id);
          setExistingReturn(found || null);
        } catch {}
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat pesanan.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleConfirm = async () => {
    setActing(true);
    try {
      await confirmReceived(id);
      toast.success("Penerimaan dikonfirmasi! Dana akan segera dicairkan ke penjual.");
      fetchOrder();
    } catch (e) { toast.error(e.response?.data?.message || "Gagal konfirmasi."); }
    finally { setActing(false); }
  };

  const handleCancel = async () => {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;
    setActing(true);
    try {
      await cancelOrder(id);
      toast.success("Pesanan dibatalkan.");
      fetchOrder();
    } catch (e) { toast.error(e.response?.data?.message || "Gagal membatalkan."); }
    finally { setActing(false); }
  };

  const AmbientBg = () => (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#F8FAFC" }}>
      <div className="absolute -top-32 -right-16 w-[420px] h-[420px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
      <div className="absolute top-[55%] -left-20 w-[360px] h-[360px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
    </div>
  );

  if (loading) return (
    <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT_BODY }}>
      <AmbientBg />
      <Navbar />
      <PageLoader />
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT_BODY }}>
      <AmbientBg />
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Back button ── */}
        <button
          onClick={() => navigate(isSeller ? "/seller/orders" : "/orders")}
          className="flex items-center gap-2 text-sm mb-6 transition-colors font-medium"
          style={{ color: CLR_SUBTLE }}
          onMouseEnter={(e) => (e.currentTarget.style.color = CLR_ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = CLR_SUBTLE)}
        >
          <ArrowLeft size={15} /> Kembali ke Pesanan
        </button>

        {/* ── Error state ── */}
        {error && (
          <Card className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(220,38,38,0.10)" }}>
              <AlertTriangle size={26} style={{ color: "#DC2626" }} />
            </div>
            <p className="mb-4 text-sm font-medium" style={{ color: "#DC2626" }}>{error}</p>
            <button onClick={fetchOrder}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:brightness-105"
              style={{ background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY }}>
              Coba Lagi
            </button>
          </Card>
        )}

        {/* ── Not found ── */}
        {!error && !order && (
          <Card className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(37,99,235,0.08)" }}>
              <Package size={26} style={{ color: CLR_ACCENT }} />
            </div>
            <p className="text-sm mb-4" style={{ color: CLR_MUTED }}>Pesanan tidak ditemukan.</p>
            <button onClick={() => navigate("/orders")}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:brightness-105"
              style={{ background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY }}>
              Lihat Semua Pesanan
            </button>
          </Card>
        )}

        {/* ── Main content ── */}
        {order && (
          <div className="space-y-4">

            {/* ── Hero card: order ID + status ── */}
            <div
              className="relative rounded-3xl overflow-hidden px-6 py-6"
              style={{ background: GRAD_PRIMARY, boxShadow: "0 16px 40px -16px rgba(37,99,235,0.45)" }}
            >
              <div className="absolute -top-14 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />
              <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />

              <div className="relative">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Nomor Pesanan</p>
                    <h1 className="text-lg font-bold text-white" style={{ fontFamily: FONT_DISPLAY }}>
                      {order.order_number}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: "rgba(255,255,255,0.18)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.3)" }}
                    >
                      {(STATUS_CONFIG[order.status] || STATUS_CONFIG.expired).icon}
                      {(STATUS_CONFIG[order.status] || STATUS_CONFIG.expired).label}
                    </span>
                  </div>
                </div>

                {/* Stepper — light card embedded inside hero for contrast */}
                {!["expired", "refunded", "disputed"].includes(order.status) && (
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.94)" }}>
                    <Stepper status={order.status} />
                  </div>
                )}
              </div>
            </div>

            {/* ── Produk ── */}
            <Card>
              <SectionLabel icon={<Package size={14} />}>Detail Produk</SectionLabel>
              <div
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: "linear-gradient(160deg, #EFF6FF 0%, #F0F9FF 100%)", border: `1px solid ${CLR_BORDER}` }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                  style={{ background: GRAD_PRIMARY, boxShadow: "0 6px 16px rgba(37,99,235,0.3)" }}
                >
                  <ShoppingBag size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: CLR_TEXT }}>
                    {order.product_snapshot?.model || order.product?.model}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: CLR_SUBTLE }}>Unit laptop bekas terverifikasi</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-base font-bold"
                    style={{ fontFamily: FONT_DISPLAY, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                  >
                    Rp {Number(order.product_price).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </Card>

            {/* ── Rincian pembayaran ── */}
            <Card>
              <SectionLabel icon={<Receipt size={14} />}>Rincian Pembayaran</SectionLabel>
              <div>
                <InfoRow label="Harga Produk"        value={`Rp ${Number(order.product_price).toLocaleString("id-ID")}`} />
                <InfoRow label="Biaya Platform (3%)" value={`Rp ${Number(order.platform_fee).toLocaleString("id-ID")}`} />
                <div className="flex justify-between items-center pt-4 mt-1">
                  <span className="font-bold text-sm" style={{ color: CLR_TEXT }}>Total Bayar</span>
                  <span
                    className="text-lg font-bold"
                    style={{ fontFamily: FONT_DISPLAY, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                  >
                    Rp {Number(order.total_amount).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </Card>

            {/* ── Info transaksi ── */}
            <Card>
              <SectionLabel icon={<User size={14} />}>Informasi Transaksi</SectionLabel>
              <div>
                <InfoRow label="Penjual"      value={order.seller?.name} />
                <InfoRow
                  label="Tanggal"
                  value={new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                />
                {order.resi_number && (
                  <InfoRow label="No. Resi" value={order.resi_number} accent />
                )}
                {order.shipping_address && (
                  <InfoRow label="Alamat Penerima" value={order.shipping_address} />
                )}
              </div>
            </Card>

            {/* ── Trust badges ── */}
            <div
              className="flex items-center justify-center gap-6 py-4 rounded-2xl"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}` }}
            >
              {[
                { icon: <Shield size={13} />, text: "Escrow aman" },
                { icon: <CheckCircle2 size={13} />, text: "Inspeksi 25 titik" },
                { icon: <Star size={13} />, text: "Terverifikasi" },
              ].map(({ icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: CLR_MUTED }}>
                  <span style={{ color: CLR_ACCENT }}>{icon}</span>{text}
                </span>
              ))}
            </div>

            {/* ── Buyer actions ── */}
            {!isSeller && order.status === "waiting_payment" && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/checkout/${id}`)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white transition hover:brightness-105 active:scale-[0.99] flex items-center justify-center gap-2"
                  style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 10px 24px -10px rgba(37,99,235,0.5)" }}
                >
                  Lanjut ke Pembayaran <ChevronRight size={15} />
                </button>
                <button
                  onClick={handleCancel} disabled={acting}
                  className="px-5 py-3.5 rounded-2xl text-sm font-semibold transition disabled:opacity-50"
                  style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}
                >
                  Batalkan
                </button>
              </div>
            )}

            {!isSeller && order.status === "shipped" && (
              <button
                onClick={handleConfirm} disabled={acting}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition hover:brightness-105 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 10px 24px -10px rgba(37,99,235,0.5)" }}
              >
                <CheckCircle2 size={16} />
                {acting ? "Memproses..." : "Konfirmasi Barang Diterima"}
              </button>
            )}

            {/* ── Rating ── */}
            {!isSeller && order.status === "completed" && !rating && (
              <RatingForm orderId={id} hasTechnician={false} onSuccess={fetchOrder} />
            )}

            {!isSeller && order.status === "completed" && rating && (
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.12)" }}
                  >
                    <Star size={17} className="fill-[#10B981]" style={{ color: "#10B981" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#10B981" }}>Ulasan Diberikan</p>
                    <p className="text-xs mt-0.5" style={{ color: CLR_MUTED }}>Terima kasih telah memberikan ulasan</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {rating.product_rating && (
                    <div className="rounded-lg px-3 py-2" style={{ background: "rgba(16,185,129,0.08)" }}>
                      <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: CLR_MUTED }}>Produk</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12}
                            style={i < rating.product_rating ? { fill: "#F59E0B", color: "#F59E0B" } : { fill: "#E2E8F0", color: "#E2E8F0" }}
                          />
                        ))}
                        <span className="text-xs font-bold ml-1" style={{ color: CLR_TEXT }}>{rating.product_rating}/5</span>
                      </div>
                    </div>
                  )}
                  <div className="rounded-lg px-3 py-2" style={{ background: "rgba(16,185,129,0.08)" }}>
                    <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: CLR_MUTED }}>Penjual</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12}
                          style={i < rating.seller_rating ? { fill: "#F59E0B", color: "#F59E0B" } : { fill: "#E2E8F0", color: "#E2E8F0" }}
                        />
                      ))}
                      <span className="text-xs font-bold ml-1" style={{ color: CLR_TEXT }}>{rating.seller_rating}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Return button ── */}
            {!isSeller && order.status === "completed" && !existingReturn && (
              <button
                onClick={() => navigate(`/returns/request/${id}`)}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold transition hover:brightness-95 flex items-center justify-center gap-2"
                style={{
                  background: "rgba(234,88,12,0.08)",
                  color: "#EA580C",
                  border: "1px solid rgba(234,88,12,0.2)",
                  fontFamily: FONT_DISPLAY,
                }}
              >
                <RefreshCw size={15} /> Ajukan Pengembalian Barang
              </button>
            )}

            {/* ── Existing return status ── */}
            {!isSeller && existingReturn && (
              <div
                className="rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer transition hover:-translate-y-0.5"
                style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.18)" }}
                onClick={() => navigate(`/returns/${existingReturn.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(37,99,235,0.10)" }}>
                    <RefreshCw size={15} style={{ color: CLR_ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: CLR_TEXT }}>Pengembalian Diajukan</p>
                    <p className="text-xs mt-0.5" style={{ color: CLR_SUBTLE }}>
                      Status: {existingReturn.status === "pending" ? "Menunggu" : existingReturn.status === "approved" ? "Disetujui" : existingReturn.status === "rejected" ? "Ditolak" : "Selesai"}
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} style={{ color: CLR_SUBTLE }} />
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}