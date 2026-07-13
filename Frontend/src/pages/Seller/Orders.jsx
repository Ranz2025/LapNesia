import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Truck, Sparkles, RefreshCw, X, ClipboardCheck, MapPin } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { toast } from "../../components/ui/Toast";
import { getOrders, shipOrder } from "../../services/orderService";

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
const CLR_DANGER    = "#EF4444";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

const STATUS_LABEL = {
  waiting_payment: "Menunggu Pembayaran",
  paid: "Dibayar",
  shipped: "Dikirim",
  completed: "Selesai",
  expired: "Dibatalkan",
  cancelled: "Dibatalkan",
};

const STATUS_STYLE = {
  waiting_payment: { background: "rgba(217,119,6,0.10)", color: "#D97706", border: "rgba(217,119,6,0.25)" },
  paid:            { background: "rgba(37,99,235,0.10)", color: CLR_ACCENT, border: "rgba(37,99,235,0.25)" },
  shipped:         { background: "rgba(8,145,178,0.10)", color: "#0891B2", border: "rgba(8,145,178,0.25)" },
  completed:       { background: "rgba(5,150,105,0.10)", color: "#059669", border: "rgba(5,150,105,0.25)" },
  expired:         { background: "rgba(100,116,139,0.10)", color: CLR_MUTED, border: "rgba(100,116,139,0.20)" },
  cancelled:       { background: "rgba(239,68,68,0.10)", color: "#DC2626", border: "rgba(239,68,68,0.25)" },
};

const STATUS_FILTERS = [
  { id: "all", label: "Semua" },
  { id: "waiting_payment", label: "Menunggu" },
  { id: "paid", label: "Dibayar" },
  { id: "shipped", label: "Dikirim" },
  { id: "completed", label: "Selesai" },
];

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

function ShipModal({ order, onClose, onShipped }) {
  const [resi, setResi] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resi.trim()) { toast.error("Masukkan nomor resi."); return; }
    setLoading(true);
    try {
      await shipOrder(order.id, resi.trim());
      toast.success("Pesanan ditandai sebagai dikirim.");
      onShipped();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memproses pengiriman.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-sm relative"
        style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}`, boxShadow: "0 20px 60px -10px rgba(15,23,42,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition"
          style={{ background: "#F8FAFC", color: CLR_SUBTLE }}
          aria-label="Tutup"
        >
          <X size={14} />
        </button>

        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: GRAD_PRIMARY, boxShadow: "0 6px 18px rgba(37,99,235,0.28)" }}
        >
          <Truck size={19} className="text-white" />
        </div>

        <h2 className="text-lg mb-1" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
          Input Nomor Resi
        </h2>
        <p className="text-sm mb-4" style={{ color: CLR_MUTED }}>
          Pesanan: <span className="font-semibold" style={{ color: CLR_TEXT }}>{order.order_number}</span>
        </p>

        {order.shipping_address && (
          <div
            className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-4 text-sm"
            style={{ background: "linear-gradient(160deg,#EFF6FF 0%,#F0F9FF 100%)", border: `1px solid ${CLR_BORDER}` }}
          >
            <MapPin size={15} className="flex-shrink-0 mt-0.5" style={{ color: CLR_ACCENT }} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: CLR_ACCENT }}>Alamat Penerima</p>
              <p style={{ color: CLR_TEXT }}>{order.shipping_address}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={resi}
            onChange={(e) => setResi(e.target.value)}
            placeholder="Contoh: JNE1234567890"
            autoFocus
            className="w-full outline-none rounded-xl px-4 py-3 placeholder:text-[#94A3B8] text-sm transition-all"
            style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
            onFocus={(e) => (e.target.style.borderColor = CLR_ACCENT)}
            onBlur={(e) => (e.target.style.borderColor = CLR_BORDER_LT)}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}`, color: CLR_MUTED, fontFamily: FONT_DISPLAY }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-110 disabled:opacity-60"
              style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY }}
            >
              {loading ? "Menyimpan..." : "Konfirmasi Kirim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SellerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [shipModal, setShipModal] = useState(null);

  const fetchOrders = async (isRefresh) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const result = await getOrders();
      const data = result?.data?.data;
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : (data?.data ?? data ?? []);
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Gagal memuat pesanan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [orders]);

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);
  const needsAction = statusCounts.paid || 0;

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      <Navbar />

      {/* ══════════════ AMBIENT GLOW BACKDROP ══════════════ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <main className={`${SECTION_X} py-8`}>

        {/* ── Hero header ── */}
        <div
          className="rounded-3xl overflow-hidden relative px-6 sm:px-10 py-7 sm:py-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          style={{ background: GRAD_HERO_BG, border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#06B6D4" }} />

          <div className="relative">
            <div className="mb-2">
              <SectionLabel icon={<Sparkles size={11} />} text="Seller Dashboard" />
            </div>
            <h1 className="text-2xl sm:text-3xl leading-tight mb-1" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}>
              Pesanan{" "}
              <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Masuk
              </span>
            </h1>
            <p className="text-sm" style={{ color: CLR_MUTED }}>
              {orders.length} total pesanan
              {needsAction > 0 && <span className="font-semibold" style={{ color: "#D97706" }}> · {needsAction} perlu dikirim</span>}
            </p>
          </div>

          <button
            onClick={() => fetchOrders(true)}
            className="relative flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition flex-shrink-0"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}`, color: CLR_MUTED }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = CLR_ACCENT)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = CLR_BORDER)}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Memperbarui..." : "Refresh"}
          </button>
        </div>

        {/* ── Status filter ── */}
        {!loading && !error && orders.length > 0 && (
          <div
            className="rounded-2xl p-4 sm:p-5 mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 12px rgba(37,99,235,0.06)" }}
          >
            {STATUS_FILTERS.map((s) => {
              const active = statusFilter === s.id;
              const count = statusCounts[s.id] || 0;
              return (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5"
                  style={
                    active
                      ? { background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY, boxShadow: "0 2px 10px rgba(37,99,235,0.25)" }
                      : { background: "#F8FAFC", color: CLR_TEXT, border: `1px solid ${CLR_BORDER_LT}` }
                  }
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = CLR_ACCENT; e.currentTarget.style.background = "#EFF6FF"; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.background = "#F8FAFC"; } }}
                >
                  {s.label}
                  <span
                    className="text-[10px] px-1.5 rounded-full"
                    style={active ? { background: "rgba(255,255,255,0.25)" } : { background: "rgba(37,99,235,0.10)", color: CLR_ACCENT }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}` }} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)" }}>
            <p className="mb-4 text-sm" style={{ color: CLR_DANGER }}>{error}</p>
            <button
              onClick={() => fetchOrders()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-110"
              style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY }}
            >
              Coba Lagi
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}` }}>
            <Package size={40} className="mx-auto mb-3" style={{ color: CLR_SUBTLE }} />
            <p className="text-sm" style={{ color: CLR_MUTED }}>Belum ada pesanan.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}` }}>
            <ClipboardCheck size={40} className="mx-auto mb-3" style={{ color: CLR_SUBTLE }} />
            <p className="text-sm" style={{ color: CLR_MUTED }}>Tidak ada pesanan dengan status ini.</p>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 12px rgba(37,99,235,0.06)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${CLR_BORDER_LT}` }}>
                    {["No. Pesanan", "Produk", "Total", "Status", "No. Resi", "Aksi"].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color: CLR_MUTED }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, idx) => {
                    const statusStyle = STATUS_STYLE[order.status] || STATUS_STYLE.expired;
                    return (
                      <tr
                        key={order.id}
                        className="transition-colors"
                        style={{
                          background: idx % 2 === 0 ? "transparent" : "#F8FAFC",
                          borderBottom: `1px solid ${CLR_BORDER_LT}`,
                        }}
                      >
                        <td className="px-5 py-3.5 font-mono text-xs" style={{ color: CLR_MUTED }}>{order.order_number}</td>
                        <td className="px-5 py-3.5 font-medium" style={{ color: CLR_TEXT }}>
                          {order.product_snapshot?.model || order.product?.model || "-"}
                        </td>
                        <td className="px-5 py-3.5 font-semibold" style={{ color: CLR_TEXT }}>
                          Rp {Number(order.total_amount).toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                            style={{ background: statusStyle.background, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
                          >
                            {STATUS_LABEL[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs" style={{ color: order.resi_number ? CLR_ACCENT : CLR_SUBTLE }}>
                          {order.resi_number || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => navigate(`/orders/${order.id}`)}
                              className="text-xs font-semibold transition hover:underline"
                              style={{ color: CLR_ACCENT }}
                            >
                              Detail
                            </button>
                            {order.status === "paid" && (
                              <button
                                onClick={() => setShipModal(order)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition hover:brightness-110"
                                style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY }}
                              >
                                <Truck size={11} /> Kirim
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {shipModal && (
        <ShipModal
          order={shipModal}
          onClose={() => setShipModal(null)}
          onShipped={() => { setShipModal(null); fetchOrders(); }}
        />
      )}
    </div>
  );
}