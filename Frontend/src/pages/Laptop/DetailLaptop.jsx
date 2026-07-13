import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Heart, Share2, Star, User,
  AlertCircle, ChevronLeft, Shield, MapPin, Cpu, HardDrive, MemoryStick, Monitor, MessageCircle
} from "lucide-react";
import { getProductBySlug } from "../../services/productService";
import { getRatingsByProduct } from "../../services/ratingService";
import { createOrder } from "../../services/orderService";
import { toast } from "../../components/ui/Toast";
import { PageLoader } from "../../components/ui/Skeleton";
import { getUser, isAuthenticated } from "../../services/authService";
import { startChat } from "../../services/chatService";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const GRADIENT = "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)";

function StarRow({ value, size = 14 }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(value) ? "fill-[#2563EB] text-[#2563EB]" : "text-[#4B4B66]"}
          style={i < Math.round(value) ? {} : { fill: "rgba(75,75,102,0.4)" }}
        />
      ))}
    </div>
  );
}

export default function DetailLaptop() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);


  useEffect(() => { fetchProduct(); }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true); setError(null);
      const data = await getProductBySlug(slug);
      setProduct(data.data);
      // Set avg rating awal dari data produk (sudah dihitung di backend)
      if (data.data?.avg_rating > 0) {
        setAvgRating(parseFloat(data.data.avg_rating).toFixed(1));
      }
      if (data.data?.id) fetchRatings(data.data.id);
    } catch {
      setError("Produk tidak ditemukan atau terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async (productId) => {
    try {
      const res = await getRatingsByProduct(productId);
      const list = res.data?.data || [];
      setRatings(list);
      setRatingCount(res.data?.total || list.length);
      if (list.length > 0) {
        // Gunakan product_rating jika ada, fallback ke seller_rating
        const rated = list.filter(r => r.product_rating || r.seller_rating);
        const avg = rated.reduce((sum, r) => sum + (r.product_rating || r.seller_rating || 0), 0) / (rated.length || 1);
        setAvgRating(avg.toFixed(1));
      }
    } catch {}
  };

  const handleChat = async () => {
    if (!isAuthenticated()) { navigate("/login?redirect=/laptop/" + slug); return; }
    if (!product?.seller?.id) return;
    try {
      const res = await startChat(product.seller.id, product.id);
      navigate("/chat/" + res.data?.data?.id);
    } catch {
      toast.error("Gagal memulai chat.");
    }
  };

  const handleBuy = async () => {
    if (!isAuthenticated()) { navigate("/login?redirect=/laptop/" + slug); return; }
    const user = getUser();
    if (user?.role !== "buyer") { toast.error("Hanya pembeli yang dapat melakukan pembelian."); return; }
    setBuying(true);
    try {
      const res = await createOrder({ product_id: product.id, shipping_address: "" });
      toast.success("Pesanan berhasil dibuat! Menuju halaman pembayaran...");
      setTimeout(() => navigate("/checkout/" + res.data.id), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuat pesanan. Silakan coba lagi.");
    } finally {
      setBuying(false);
    }
  };

  const mainImage = product?.all_images?.[selectedImage]?.url || product?.primary_image || null;

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div style={{ background: "#F0F9FF", minHeight: "100vh" }}>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <AlertCircle className="mx-auto mb-4" style={{ color: "#2563EB" }} size={48} />
          <h2 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: FONT_DISPLAY }}>
            Produk tidak ditemukan
          </h2>
          <p className="text-[#64748B] mb-8 text-sm">{error}</p>
          <button
            onClick={() => navigate("/laptop")}
            className="flex items-center gap-2 mx-auto text-sm"
            style={{ color: "#2563EB" }}
          >
            <ChevronLeft size={16} /> Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  const specs = [
    { icon: <Cpu size={14} />, label: "Processor", value: product.cpu || "N/A" },
    { icon: <MemoryStick size={14} />, label: "RAM", value: product.ram ? `${product.ram} GB` : "N/A" },
    { icon: <HardDrive size={14} />, label: "Storage", value: product.storage ? `${product.storage} GB ${product.storage_type || "SSD"}` : "N/A" },
    { icon: <Monitor size={14} />, label: "GPU", value: product.gpu || "Integrated" },
    { icon: <Shield size={14} />, label: "Kondisi", value: product.condition?.replace("_", " ") || "N/A" },
    { icon: <MapPin size={14} />, label: "Lokasi", value: product.location || "N/A" },
  ];

  return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Breadcrumb */}
        <div className="pt-8 mb-8">
          <button
            onClick={() => navigate("/laptop")}
            className="flex items-center gap-1.5 text-sm transition hover:brightness-110"
            style={{ color: "#60A5FA" }}
          >
            <ChevronLeft size={16} /> Kembali ke Katalog
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Left: Image Gallery ── */}
          <div>
            {/* Main image */}
            <div
              className="relative rounded-2xl flex items-center justify-center mb-3 overflow-hidden"
              style={{
                height: 360,
                background: "#FFFFFF",
                border: "1px solid #BFDBFE",
              }}
            >
              {mainImage ? (
                <img src={mainImage} alt={product.model} className="w-full h-full object-contain p-4" />
              ) : (
                <ShoppingCart className="text-[#4B4B66]" size={56} />
              )}
            </div>

            {/* Thumbnails */}
            {product.all_images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.all_images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className="rounded-xl overflow-hidden transition"
                    style={{
                      height: 72,
                      border: selectedImage === idx
                        ? "2px solid #2563EB"
                        : "1px solid #BFDBFE",
                      background: "#FFFFFF",
                    }}
                  >
                    <img src={img.url} alt={`Gambar ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div className="flex flex-col gap-5">

            {/* Title */}
            <div>
              {product.brand?.name && (
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#60A5FA" }}>
                  {product.brand.name}
                </p>
              )}
              <h1
                className="text-2xl md:text-3xl text-[#0F172A] leading-tight"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
              >
                {product.model}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <StarRow value={avgRating} />
                <span className="text-xs text-[#64748B]">
                  {avgRating > 0 ? avgRating : "Belum ada rating"}
                  {ratingCount > 0 && ` · ${ratingCount} ulasan`}
                </span>
              </div>
            </div>

            {/* Price */}
            <div
              className="rounded-2xl px-5 py-4"
              style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}
            >
              <p className="text-xs text-[#64748B] mb-1">Harga</p>
              <p
                className="text-3xl"
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 800,
                  backgroundImage: GRADIENT,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Rp {Number(product.price).toLocaleString("id-ID")}
              </p>
              {/* Stok & Inspeksi info */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {product.is_out_of_stock || product.stock === 0 ? (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(239,68,68,0.12)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.25)" }}
                  >
                    ✕ Stok Habis
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(5,150,105,0.10)", color: "#059669", border: "1px solid rgba(5,150,105,0.20)" }}
                  >
                    ✓ Tersedia · {product.stock} unit
                  </span>
                )}
                {product.inspection_ready && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(37,99,235,0.08)", color: "#2563EB", border: "1px solid rgba(37,99,235,0.20)" }}
                  >
                    🔍 Bersedia Inspeksi
                  </span>
                )}
              </div>
            </div>

            {/* Specs */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}
            >
              <h3
                className="text-sm font-semibold text-[#0F172A] mb-3"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Spesifikasi
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {specs.map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "#2563EB" }}>{icon}</span>
                    <div>
                      <p className="text-[10px] text-[#6B6B85] uppercase tracking-wide">{label}</p>
                      <p className="text-xs text-[#475569] font-medium capitalize">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller */}
            {product.seller && (
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ background: "rgba(37,99,235,0.15)" }}
                >
                  {product.seller.profile_photo_url ? (
                    <img src={product.seller.profile_photo_url} className="w-full h-full object-cover" alt="seller" />
                  ) : (
                    <User size={18} style={{ color: "#2563EB" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#6B6B85] mb-0.5">Penjual</p>
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{product.seller.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={11} className="fill-[#2563EB] text-[#2563EB]" />
                    <span className="text-[11px] text-[#64748B]">{product.seller.avg_rating || "0"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBuy}
                disabled={buying || product.status !== "active" || product.is_out_of_stock || product.stock === 0}
                className="flex-1 py-3 rounded-full font-semibold text-[#0F172A] text-sm transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: GRADIENT, fontFamily: FONT_DISPLAY }}
              >
                <ShoppingCart size={16} />
                {buying
                  ? "Memproses..."
                  : (product.is_out_of_stock || product.stock === 0)
                    ? "Stok Habis"
                    : "Beli Sekarang"}
              </button>

              <button
                onClick={() => navigate("/technicians", { state: { product_id: product.id, product_slug: product.slug } })}
                className="px-5 py-3 rounded-full text-sm font-semibold transition hover:brightness-110 whitespace-nowrap"
                style={{
                  background: "rgba(37,99,235,0.12)",
                  border: "1px solid rgba(37,99,235,0.35)",
                  color: "#60A5FA",
                  fontFamily: FONT_DISPLAY,
                }}
              >
                Pesan Teknisi
              </button>

              <button
                onClick={handleChat}
                className="px-4 py-3 rounded-full transition flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(52,211,153,0.3)",
                  color: "#34D399",
                  fontFamily: FONT_DISPLAY,
                }}
              >
                <MessageCircle size={15} />
                Chat
              </button>

              <button
                onClick={() => setWishlisted((w) => !w)}
                className="px-4 py-3 rounded-full transition"
                style={{
                  background: "#F8FAFC",
                  border: `1px solid ${wishlisted ? "#2563EB" : "rgba(255,255,255,0.1)"}`,
                  color: wishlisted ? "#2563EB" : "#4B4B66",
                }}
                aria-label="Simpan ke favorit"
              >
                <Heart size={16} className={wishlisted ? "fill-[#2563EB]" : ""} />
              </button>

              <button
                onClick={() => {
                  navigator.share?.({ title: product.model, url: window.location.href }) ||
                    navigator.clipboard.writeText(window.location.href).then(() => toast.success("Link disalin!"));
                }}
                className="px-4 py-3 rounded-full transition"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#4B4B66",
                }}
                aria-label="Bagikan"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div
            className="mt-10 rounded-2xl p-6"
            style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}
          >
            <h2
              className="text-lg text-[#0F172A] mb-4"
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
            >
              Deskripsi
            </h2>
            <p className="text-[#475569] text-sm leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}

        {/* Ratings */}
        {ratings.length > 0 && (
          <div
            className="mt-6 rounded-2xl p-6"
            style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}
          >
            {/* Header */}
            <div className="flex items-baseline justify-between mb-6 pb-4" style={{ borderBottom: "1px solid #BFDBFE" }}>
              <h2 className="text-lg text-[#0F172A]" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}>
                Ulasan Produk
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className="text-2xl"
                  style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, backgroundImage: GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                >
                  {avgRating}
                </span>
                <div>
                  <StarRow value={avgRating} size={13} />
                  <p className="text-[10px] text-[#6B6B85] mt-0.5">{ratingCount} ulasan</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {ratings.slice(0, 5).map((r) => {
                const displayRating = r.product_rating || r.seller_rating;
                const displayReview = r.product_review || r.seller_review;
                return (
                  <div
                    key={r.id}
                    className="pb-5 last:pb-0"
                    style={{ borderBottom: "1px solid #EFF6FF" }}
                  >
                    {/* Reviewer info */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
                        style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA" }}
                      >
                        {r.order?.buyer?.profile_photo_url ? (
                          <img src={r.order.buyer.profile_photo_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          (r.order?.buyer?.name || "P")[0].toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0F172A] leading-none">
                          {r.order?.buyer?.name || "Pembeli"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRow value={displayRating} size={11} />
                          <span className="text-[10px] text-[#94A3B8]">
                            {r.created_at ? new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : ""}
                          </span>
                        </div>
                      </div>
                      {/* Badge rating produk */}
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: "rgba(245,158,11,0.12)", color: "#D97706" }}
                      >
                        ★ {displayRating}/5
                      </span>
                    </div>

                    {/* Review teks */}
                    {displayReview && (
                      <p className="text-sm text-[#475569] leading-relaxed pl-10">
                        {displayReview}
                      </p>
                    )}

                    {/* Jika ada seller_review berbeda */}
                    {r.product_review && r.seller_review && r.seller_review !== r.product_review && (
                      <div
                        className="ml-10 mt-2 px-3 py-2 rounded-lg"
                        style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.10)" }}
                      >
                        <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "#94A3B8" }}>
                          Ulasan Penjual
                        </p>
                        <p className="text-xs text-[#475569]">{r.seller_review}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Lihat semua jika lebih dari 5 */}
            {ratingCount > 5 && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid #EFF6FF" }}>
                <p className="text-center text-xs" style={{ color: "#94A3B8" }}>
                  Menampilkan 5 dari {ratingCount} ulasan
                </p>
              </div>
            )}
          </div>
        )}

        {/* Jika belum ada ulasan */}
        {ratings.length === 0 && product?.status === "active" && (
          <div
            className="mt-6 rounded-2xl p-8 text-center"
            style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}
          >
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(37,99,235,0.08)" }}>
              <Star size={20} style={{ color: "#2563EB" }} />
            </div>
            <p className="text-sm font-semibold text-[#0F172A] mb-1" style={{ fontFamily: FONT_DISPLAY }}>
              Belum ada ulasan
            </p>
            <p className="text-xs text-[#64748B]">Jadilah yang pertama mengulas produk ini</p>
          </div>
        )}
      </main>

    </div>
  );
}