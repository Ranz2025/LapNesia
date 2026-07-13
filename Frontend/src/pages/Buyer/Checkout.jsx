import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, ChevronLeft, AlertCircle, ShoppingBag, ShieldCheck, Receipt, Clock, Lock, MapPin, Pencil, Check, X } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getOrder, payOrder, updateShippingAddress } from "../../services/orderService";
import { toast } from "../../components/ui/Toast";
import { PageLoader } from "../../components/ui/Skeleton";

/* ─── DESIGN TOKENS (selaras dengan Home.jsx / AdminDashboard.jsx) ── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#64748B";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const unwrap = (payload) => {
  const data = payload?.data;
  if (data?.data) return data.data;
  return data ?? payload ?? null;
};

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  // State edit alamat
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressInput, setAddressInput]     = useState("");
  const [savingAddress, setSavingAddress]   = useState(false);

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrder(id);
      setOrder(unwrap(res));
    } catch {
      setError("Order tidak ditemukan atau sudah tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!order.shipping_address?.trim()) {
      toast.error("Harap isi alamat penerima terlebih dahulu.");
      setEditingAddress(true);
      setAddressInput("");
      return;
    }
    setPaying(true);
    try {
      const res = await payOrder(id);
      const payment = unwrap(res);
      const redirectUrl = payment?.snap_redirect_url || payment?.snap?.redirect_url || payment?.redirect_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        toast.error("URL pembayaran tidak tersedia. Silakan coba lagi.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memproses pembayaran. Silakan coba lagi.");
    } finally {
      setPaying(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressInput.trim() || addressInput.trim().length < 10) {
      toast.error("Alamat minimal 10 karakter.");
      return;
    }
    setSavingAddress(true);
    try {
      const res = await updateShippingAddress(id, addressInput.trim());
      setOrder(unwrap(res));
      setEditingAddress(false);
      toast.success("Alamat penerima berhasil diperbarui.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan alamat.");
    } finally {
      setSavingAddress(false);
    }
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

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT_BODY }}>
        <AmbientBg />
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "rgba(220,38,38,0.10)" }}>
            <AlertCircle size={28} style={{ color: "#DC2626" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>Order tidak ditemukan</h2>
          <p className="mb-6 text-sm" style={{ color: CLR_MUTED }}>{error}</p>
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-105"
            style={{ background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY }}
          >
            Lihat Semua Order
          </button>
        </div>
      </div>
    );
  }

  if (order?.status === "paid" || order?.status === "shipped" || order?.status === "completed") {
    return (
      <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT_BODY }}>
        <AmbientBg />
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "rgba(16,185,129,0.12)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>Pembayaran Berhasil!</h2>
          <p className="mb-6 text-sm" style={{ color: CLR_MUTED }}>
            Pesanan kamu sedang diproses oleh penjual.
          </p>
          <button
            onClick={() => navigate("/orders/" + id)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-105"
            style={{ background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY }}
          >
            Lihat Detail Order
          </button>
        </div>
      </div>
    );
  }

  if (order?.status !== "waiting_payment") {
    return (
      <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT_BODY }}>
        <AmbientBg />
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "rgba(234,158,12,0.10)" }}>
            <AlertCircle size={28} style={{ color: "#CA8A04" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>Order tidak dapat dibayar</h2>
          <p className="mb-6 text-sm" style={{ color: CLR_MUTED }}>
            Status order saat ini: <strong style={{ color: CLR_TEXT }}>{order?.status}</strong>
          </p>
          <button
            onClick={() => navigate("/orders/" + id)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-105"
            style={{ background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY }}
          >
            Lihat Detail Order
          </button>
        </div>
      </div>
    );
  }

  const productName = order.product_snapshot?.model || "Produk";
  const productBrand = order.product_snapshot?.brand;
  const productPrice = Number(order.product_price);
  const platformFee = Number(order.platform_fee);
  const total = Number(order.total_amount);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT_BODY }}>
      <AmbientBg />
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm mb-5 transition font-medium"
          style={{ color: CLR_SUBTLE }}
          onMouseEnter={(e) => (e.currentTarget.style.color = CLR_ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = CLR_SUBTLE)}
        >
          <ChevronLeft size={16} /> Kembali
        </button>

        {/* ══════════ Header banner ══════════ */}
        <div
          className="relative rounded-2xl overflow-hidden mb-6 px-6 py-6"
          style={{ background: GRAD_PRIMARY, boxShadow: "0 16px 36px -16px rgba(37,99,235,0.45)" }}
        >
          <div className="absolute -top-10 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: "#FFFFFF" }} />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.18)" }}>
              <Receipt size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white" style={{ fontFamily: FONT_DISPLAY }}>Checkout</h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>Selesaikan pembayaran untuk mengamankan pesananmu</p>
            </div>
          </div>
        </div>

        {/* ══════════ Order Summary ══════════ */}
        <div
          className="rounded-2xl p-6 mb-5"
          style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <ShoppingBag size={16} style={{ color: CLR_ACCENT }} />
            <h2 className="font-semibold text-sm" style={{ color: CLR_TEXT }}>Ringkasan Pesanan</h2>
          </div>

          {/* Product card */}
          <div
            className="flex items-center gap-3 rounded-xl p-3 mb-5"
            style={{ background: "linear-gradient(160deg, #EFF6FF 0%, #F0F9FF 100%)", border: `1px solid ${CLR_BORDER}` }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: GRAD_PRIMARY }}
            >
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: CLR_TEXT }}>
                {productBrand ? `${productBrand} ${productName}` : productName}
              </p>
              <p className="text-xs" style={{ color: CLR_SUBTLE }}>Order #{order.order_number}</p>
            </div>
          </div>

          <div className="text-sm space-y-2.5">
            <div className="flex justify-between">
              <span style={{ color: CLR_SUBTLE }}>Harga Produk</span>
              <span style={{ color: CLR_MUTED }}>Rp {productPrice.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: CLR_SUBTLE }}>Biaya Platform (3%)</span>
              <span style={{ color: CLR_MUTED }}>Rp {platformFee.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div
            className="flex justify-between items-center mt-5 pt-5 rounded-xl px-4 py-3.5 -mx-1"
            style={{ borderTop: `1px dashed ${CLR_BORDER}` }}
          >
            <span className="font-bold text-sm" style={{ color: CLR_TEXT }}>Total Pembayaran</span>
            <span
              className="font-extrabold text-xl"
              style={{ fontFamily: FONT_DISPLAY, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
            >
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Alamat Penerima */}
          <div
            className="rounded-xl p-4 mt-4"
            style={{ background: "linear-gradient(160deg,#EFF6FF 0%,#F0F9FF 100%)", border: `1px solid ${CLR_BORDER}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} style={{ color: CLR_ACCENT }} />
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: CLR_ACCENT }}>
                  Alamat Penerima
                </p>
              </div>
              {/* Tombol edit — hanya tampil saat belum bayar */}
              {!editingAddress && (
                <button
                  onClick={() => { setAddressInput(order.shipping_address || ""); setEditingAddress(true); }}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition hover:brightness-95"
                  style={{ background: "rgba(37,99,235,0.10)", color: CLR_ACCENT }}
                >
                  <Pencil size={11} /> Masukan Alamat
                </button>
              )}
            </div>

            {editingAddress ? (
              <div className="space-y-2 mt-1">
                <textarea
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Contoh: Jl. Merdeka No. 12, RT 03/RW 05, Kelurahan Kebon Jeruk, Kec. Kebon Jeruk, Jakarta Barat 11530"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition placeholder:text-[#94A3B8]"
                  style={{ background: "#fff", border: `1.5px solid ${CLR_ACCENT}`, color: CLR_TEXT }}
                  autoFocus
                />
                <p className="text-[10px] text-right" style={{ color: CLR_SUBTLE }}>{addressInput.length}/500</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAddress}
                    disabled={savingAddress}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
                    style={{ background: GRAD_PRIMARY }}
                  >
                    <Check size={14} /> {savingAddress ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    onClick={() => setEditingAddress(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:bg-[#F1F5F9]"
                    style={{ border: `1px solid ${CLR_BORDER_LT}`, color: CLR_MUTED }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: order.shipping_address ? CLR_TEXT : CLR_SUBTLE }}>
                {order.shipping_address || "Belum ada alamat penerima"}
              </p>
            )}
          </div>
        </div>

        {/* Expiry Warning */}
        {order.booking_expires_at && (
          <div
            className="flex items-start gap-2.5 rounded-xl p-3.5 mb-5 text-sm"
            style={{ background: "rgba(234,158,12,0.08)", border: "1px solid rgba(234,158,12,0.25)" }}
          >
            <Clock size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#CA8A04" }} />
            <span style={{ color: "#92660A" }}>
              Selesaikan pembayaran sebelum{" "}
              <strong>{new Date(order.booking_expires_at).toLocaleString("id-ID")}</strong>
            </span>
          </div>
        )}

        {/* Trust note */}
        <div className="flex items-center gap-2 mb-5 px-1">
          <ShieldCheck size={14} style={{ color: "#10B981" }} />
          <p className="text-xs" style={{ color: CLR_SUBTLE }}>
            Dana ditahan aman lewat escrow sampai kamu konfirmasi unit diterima.
          </p>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 12px 28px -10px rgba(37,99,235,0.5)" }}
        >
          <CreditCard size={20} />
          {paying ? "Memproses..." : "Bayar Sekarang via Midtrans"}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-3.5">
          <Lock size={11} style={{ color: CLR_SUBTLE }} />
          <p className="text-[11px]" style={{ color: CLR_SUBTLE }}>Pembayaran terenkripsi dan aman</p>
        </div>
      </div>
    </div>
  );
}