import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, ChevronRight, RefreshCw, ShoppingBag, Clock,
  CreditCard, Truck, CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getOrders } from "../../services/orderService";
import { TableSkeleton } from "../../components/ui/Skeleton";

/* ─── DESIGN TOKENS (selaras dengan Home.jsx / OrderDetail.jsx) ──── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#64748B";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const SECTION_X = "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8";

const STATUS_LABEL = {
  waiting_payment: "Menunggu Pembayaran",
  paid: "Dibayar",
  shipped: "Dikirim",
  completed: "Selesai",
  expired: "Kedaluwarsa",
  refunded: "Dikembalikan",
  disputed: "Sengketa",
};

const STATUS_META = {
  waiting_payment: { bg: "rgba(202,138,4,0.10)",  fg: "#CA8A04", icon: <Clock size={12} /> },
  paid:            { bg: "rgba(37,99,235,0.10)",  fg: "#2563EB", icon: <CreditCard size={12} /> },
  shipped:         { bg: "rgba(8,145,178,0.10)",  fg: "#0891B2", icon: <Truck size={12} /> },
  completed:       { bg: "rgba(16,185,129,0.10)", fg: "#10B981", icon: <CheckCircle2 size={12} /> },
  expired:         { bg: "rgba(100,116,139,0.10)",fg: "#64748B", icon: <XCircle size={12} /> },
  refunded:        { bg: "rgba(234,88,12,0.10)",  fg: "#EA580C", icon: <RefreshCw size={12} /> },
  disputed:        { bg: "rgba(220,38,38,0.10)",  fg: "#DC2626", icon: <AlertTriangle size={12} /> },
};

const PRODUCT_GRADS = [
  "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
  "linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)",
  "linear-gradient(135deg, #C084FC 0%, #9333EA 100%)",
  "linear-gradient(135deg, #FB923C 0%, #EA580C 100%)",
  "linear-gradient(135deg, #34D399 0%, #059669 100%)",
];
const gradFor = (str = "") => {
  const code = [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PRODUCT_GRADS[code % PRODUCT_GRADS.length];
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true); setError(null);
      const res = await getOrders();
      setOrders(res.data?.data || res.data || []);
    } catch {
      setError("Gagal memuat riwayat pesanan.");
    } finally {
      setLoading(false);
    }
  };

  const activeCount = orders.filter((o) => ["waiting_payment", "paid", "shipped"].includes(o.status)).length;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT_BODY }}>

      {/* Ambient glow backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#F8FAFC" }}>
        <div className="absolute -top-32 -right-16 w-[420px] h-[420px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[360px] h-[360px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <Navbar />

      <main className={`${SECTION_X} py-8`}>

        {/* ══════════ Hero Header ══════════ */}
        <div
          className="relative rounded-3xl overflow-hidden mb-7 px-6 sm:px-8 py-7"
          style={{ background: GRAD_PRIMARY, boxShadow: "0 16px 40px -16px rgba(37,99,235,0.45)" }}
        >
          <div className="absolute -top-14 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />
          <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.18)" }}>
                <Package size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white" style={{ fontFamily: FONT_DISPLAY }}>
                  Riwayat Pesanan
                </h1>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {orders.length > 0
                    ? `${orders.length} pesanan · ${activeCount} sedang berjalan`
                    : "Semua transaksimu akan tampil di sini"}
                </p>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition flex-shrink-0 disabled:opacity-60"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <RefreshCw size={15} className={`text-white ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : error ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)" }}
          >
            <p className="mb-3 text-sm font-medium" style={{ color: "#DC2626" }}>{error}</p>
            <button
              onClick={fetchOrders}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition"
              style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}
            >
              Coba Lagi
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
          >
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(37,99,235,0.08)" }}>
              <Package className="w-7 h-7" style={{ color: CLR_ACCENT }} />
            </div>
            <h3 className="font-semibold mb-1" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>Belum ada pesanan</h3>
            <p className="text-sm mb-6" style={{ color: CLR_SUBTLE }}>Mulai belanja untuk membuat pesanan pertama.</p>
            <button
              onClick={() => navigate("/laptop")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:brightness-105 active:scale-95"
              style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 8px 20px -8px rgba(37,99,235,0.5)" }}
            >
              <ShoppingBag size={15} /> Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const meta = STATUS_META[order.status] || STATUS_META.expired;
              const productName = order.product_snapshot?.model || order.product?.model || "Produk";
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="group rounded-2xl p-4 sm:p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = CLR_BORDER; e.currentTarget.style.boxShadow = "0 12px 28px -10px rgba(37,99,235,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                    style={{ background: gradFor(productName + order.order_number), boxShadow: "0 6px 14px -4px rgba(37,99,235,0.35)" }}
                  >
                    <ShoppingBag size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: CLR_TEXT }}>
                      {productName}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: CLR_SUBTLE }}>{order.order_number}</p>
                    <p
                      className="text-sm font-bold mt-1"
                      style={{ fontFamily: FONT_DISPLAY, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                    >
                      Rp {Number(order.total_amount).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: meta.bg, color: meta.fg }}
                    >
                      {meta.icon}
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                    <span className="text-xs" style={{ color: "#94A3B8" }}>
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    style={{ color: CLR_SUBTLE }}
                    className="flex-shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-[#2563EB]"
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}