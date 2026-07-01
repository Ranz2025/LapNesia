import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { toast } from "../../components/ui/Toast";
import { PageLoader } from "../../components/ui/Skeleton";
import { getOrder } from "../../services/orderService";
import { requestReturn } from "../../services/returnService";
import { ArrowLeft, Package, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const GRADIENT = "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}>
      {children}
    </div>
  );
}

export default function ReturnRequest() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const REASON_OPTIONS = [
    "Barang tidak sesuai deskripsi",
    "Barang rusak saat diterima",
    "Barang tidak berfungsi dengan baik",
    "Spesifikasi berbeda dengan yang tertera",
    "Kondisi barang lebih buruk dari yang dideskripsikan",
    "Lainnya",
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrder(orderId);
        setOrder(res.data?.data ?? res.data ?? null);
      } catch {
        toast.error("Gagal memuat data pesanan.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) {
      toast.error("Alasan pengembalian minimal 10 karakter.");
      return;
    }
    if (!confirm("Yakin ingin mengajukan pengembalian untuk pesanan ini?")) return;

    setSubmitting(true);
    try {
      await requestReturn(orderId, reason.trim());
      setSubmitted(true);
      toast.success("Pengajuan pengembalian berhasil dikirim!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengajukan pengembalian.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh" }}>
      <Navbar />
      <PageLoader />
    </div>
  );

  return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: "#64748B" }}
          onMouseEnter={e => e.currentTarget.style.color = "#2563EB"}
          onMouseLeave={e => e.currentTarget.style.color = "#64748B"}
        >
          <ArrowLeft size={15} /> Kembali ke Detail Pesanan
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2563EB" }} />
            <span className="text-[11px] tracking-widest uppercase" style={{ color: "#60A5FA" }}>Buyer</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: FONT_DISPLAY }}>
            Ajukan Pengembalian
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            Isi formulir di bawah untuk mengajukan pengembalian barang.
          </p>
        </div>

        {/* Submitted state */}
        {submitted ? (
          <Card>
            <div className="text-center py-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}
              >
                <CheckCircle2 size={32} style={{ color: "#4ADE80" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: FONT_DISPLAY, color: "#0F172A" }}>
                Pengajuan Terkirim!
              </h2>
              <p className="text-sm mb-6" style={{ color: "#64748B" }}>
                Permintaan pengembalian barang Anda telah dikirim ke penjual. Pantau status di halaman Daftar Return.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate("/returns")}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#0F172A] transition hover:brightness-110"
                  style={{ background: GRADIENT, fontFamily: FONT_DISPLAY }}
                >
                  Lihat Daftar Return
                </button>
                <button
                  onClick={() => navigate(`/orders/${orderId}`)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold transition"
                  style={{ background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0" }}
                >
                  Detail Pesanan
                </button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Order summary */}
            {order && (
              <Card className="mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}
                  >
                    <Package size={18} style={{ color: "#2563EB" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#0F172A" }}>
                      {order.product_snapshot?.model || order.product?.model || "—"}
                    </p>
                    <p className="text-xs" style={{ color: "#64748B" }}>
                      {order.order_number} · Rp {Number(order.total_amount).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Warning */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl mb-4"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#FBBF24" }} />
              <p className="text-xs" style={{ color: "#92400E" }}>
                Permintaan return hanya bisa diajukan sekali per pesanan. Penjual akan mereview dan merespons dalam 1-3 hari kerja.
              </p>
            </div>

            {/* Form */}
            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#0F172A" }}>
                    Pilih Alasan Pengembalian
                  </label>
                  <div className="space-y-2">
                    {REASON_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition"
                        style={{
                          background: reason === opt ? "rgba(37,99,235,0.08)" : "#F8FAFC",
                          border: reason === opt ? "1px solid rgba(37,99,235,0.4)" : "1px solid #E2E8F0",
                        }}
                      >
                        <input
                          type="radio"
                          name="reason_preset"
                          value={opt}
                          checked={reason === opt}
                          onChange={(e) => setReason(e.target.value)}
                          className="accent-blue-600"
                        />
                        <span className="text-sm" style={{ color: "#334155" }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0F172A" }}>
                    Penjelasan Detail <span style={{ color: "#F87171" }}>*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="Deskripsikan masalah secara detail. Minimal 10 karakter..."
                    className="w-full outline-none rounded-xl px-4 py-3 text-sm resize-none placeholder:text-[#94A3B8]"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      color: "#0F172A",
                    }}
                    onFocus={e => e.target.style.borderColor = "#2563EB"}
                    onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  />
                  <p className="text-xs mt-1 text-right" style={{ color: reason.length < 10 ? "#F87171" : "#94A3B8" }}>
                    {reason.length}/1000 karakter {reason.length < 10 && "(minimal 10)"}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || reason.trim().length < 10}
                  className="w-full py-3 rounded-full text-sm font-semibold text-[#0F172A] transition hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: GRADIENT, fontFamily: FONT_DISPLAY }}
                >
                  {submitting ? (
                    <><RefreshCw size={15} className="animate-spin" /> Mengirim...</>
                  ) : (
                    <><RefreshCw size={15} /> Ajukan Pengembalian</>
                  )}
                </button>
              </form>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
