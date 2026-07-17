import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ChevronRight, ShoppingBag, Star, CheckCircle,
  Shield, Heart, Truck, RotateCcw, Sparkles,
  Quote, ArrowRight, TrendingUp, Users, Award, Zap, PlayCircle,
  FileText, BadgeCheck
} from "lucide-react";
import { getAllProducts } from "../../services/productService";
import { CardSkeleton } from "../../components/ui/Skeleton";

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY  = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG  = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const GRAD_CARD_BG  = "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)";
const GRAD_CTA_BG   = "radial-gradient(ellipse at 20% 20%, rgba(37,99,235,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.12) 0%, transparent 60%), linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

/* Shared vertical rhythm so every section breathes the same amount */
const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
const SECTION_Y = "py-10 md:py-14";

/* ─── STAMP SVG ─────────────────────────────────────────────── */
function GradientStamp({ size = 80 }) {
  return (
    <div
      style={{ width: size, height: size, transform: "rotate(-12deg)" }}
      className="select-none flex-shrink-0"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#2563EB" />
            <stop offset="50%"  stopColor="#0891B2" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="url(#sg)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#sg)" strokeWidth="1" strokeDasharray="2 3" />
        <path d="M33 52 L45 64 L68 39" fill="none" stroke="url(#sg)" strokeWidth="4.5"
              strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="80" textAnchor="middle" fontSize="7" fill="#06B6D4"
              fontWeight="700" letterSpacing="0.5">LULUS CEK</text>
      </svg>
    </div>
  );
}

/* ─── SECTION LABEL ─────────────────────────────────────────── */
function SectionLabel({ icon, text, color = "#2563EB", bg = "rgba(37,99,235,0.08)", border = "rgba(37,99,235,0.20)", align = "left" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-3 ${align === "center" ? "mx-auto" : ""}`}
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {icon} {text}
    </span>
  );
}

/* Reusable section header so titles share consistent sizing + spacing */
function SectionHeader({ label, labelColor, labelBg, labelBorder, title, accentWord, desc, align = "left" }) {
  const isCenter = align === "center";
  return (
    <div className={`mb-9 ${isCenter ? "text-center max-w-xl mx-auto" : ""}`}>
      <div className={isCenter ? "flex justify-center" : ""}>
        <SectionLabel icon={label.icon} text={label.text} color={labelColor} bg={labelBg} border={labelBorder} />
      </div>
      <h2
        className="text-2xl md:text-3xl leading-tight"
        style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}
      >
        {title}{" "}
        {accentWord && (
          <span
            style={{
              backgroundImage: GRAD_PRIMARY,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {accentWord}
          </span>
        )}
      </h2>
      {desc && (
        <p className="text-sm mt-3 leading-relaxed" style={{ color: CLR_MUTED }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* ─── STATIC DATA ────────────────────────────────────────────── */
const STATS = [
  { value: "5.000+", label: "Laptop Terjual",  icon: <TrendingUp size={18} /> },
  { value: "100%",   label: "Unit Diinspeksi", icon: <Award size={18} /> },
  { value: "4.9/5",  label: "Rating Pengguna", icon: <Star size={18} /> },
  { value: "98%",    label: "Pembeli Puas",    icon: <Users size={18} /> },
];

const FEATURES = [
  { icon: <Shield size={24} />,     title: "Teknisi Bersertifikat Resmi",   desc: "Setiap unit dapat diperiksa oleh teknisi yang tersertifikasi sebelum dibeli.", accent: "#2563EB" },
  { icon: <ShoppingBag size={24} />, title: "Escrow Aman",        desc: "Dana ditahan sampai kamu konfirmasi unit sesuai laporan inspeksi.",            accent: "#1D4ED8" },
  { icon: <FileText size={24} />,    title: "Informasi Transparan", desc: "Setiap produk dilengkapi informasi kondisi yang lengkap dan transparan sebelum kamu membelinya.",          accent: "#0891B2" },
  { icon: <BadgeCheck size={24} />, title: "Kualitas Terbaik",     desc: "Menyediakan laptop berkualitas dengan harga yang kompetitif dan transparan.",               accent: "#06B6D4" },
];

const STEPS = [
  { num: "01", title: "Cari & Pilih",   desc: "Telusuri katalog dan bandingkan spesifikasi yang sesuai kebutuhanmu." },
  { num: "02", title: "Cek Laporan",    desc: "Baca laporan inspeksi oleh teknisi tersertifikasi sebelum memutuskan membeli." },
  { num: "03", title: "Bayar via Escrow", desc: "Dana aman ditahan sistem sampai unit kamu terima dan setujui." },
  { num: "04", title: "Terima & Nikmati", desc: "Konfirmasi unit sesuai laporan, dana baru diteruskan ke penjual." },
];

const TESTIMONIALS = [
  { name: "Andi Pratama", role: "Game Developer", initial: "A", quote: "Laporan inspeksinya detail banget, unit yang sampai persis seperti deskripsi. Sangat rekomendasikan!", rating: 5 },
  { name: "Siti Rahma",   role: "UI/UX Designer", initial: "S", quote: "Proses escrow bikin tenang, dana baru cair setelah aku cek fisik dan kondisi laptop.",                 rating: 5 },
  { name: "Budi Santoso", role: "IT Manager",     initial: "B", quote: "Harga jauh lebih masuk akal dibanding beli baru, kualitas tetap terjaga dan aman.",                    rating: 5 },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    getAllProducts({})
      .then((r) => {
        const arr = Array.isArray(r.data) ? r.data : (r.data?.data || []);
        setProducts(arr.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/laptop${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  return (
    <div style={{ fontFamily: FONT_BODY }}>

      {/* ══════════════ AMBIENT GLOW BACKDROP ══════════════ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-30 blur-[130px]"
             style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-25 blur-[130px]"
             style={{ background: "#67E8F9" }} />
        <div className="absolute bottom-0 right-1/3 w-[320px] h-[320px] rounded-full opacity-18 blur-[120px]"
             style={{ background: "#93C5FD" }} />
      </div>

      {/* ══════════════════ HERO SECTION ══════════════════ */}
      <section className={`${SECTION_X} pt-8 pb-6`}>
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: GRAD_HERO_BG, border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
               style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
               style={{ background: "#06B6D4" }} />

          {/* items-center -> items-stretch keeps both columns visually balanced on tall hero */}
          <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-10 px-6 sm:px-10 md:px-14 py-12 md:py-16">

            {/* ── Left copy ── */}
            <div className="min-w-0 order-2 lg:order-1">
              <SectionLabel icon={<Zap size={11} />} text="Platform jual beli laptop bekas dengan inspeksi" />

              <h1
                className="text-4xl sm:text-5xl leading-[1.1] mb-5"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}
              >
                Marketplace Laptop Bekas yang{" "}
                <span
                  style={{
                    backgroundImage: GRAD_PRIMARY,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Aman dan Terpercaya.
                </span>
              </h1>

              <p className="text-[15px] leading-relaxed mb-8 max-w-[460px]" style={{ color: CLR_MUTED }}>
                Belanja laptop bekas lebih aman dengan informasi produk yang transparan,
                dan diinspeksi oleh <strong style={{ color: CLR_TEXT }}>teknisi tersertifikasi</strong>.
              </p>

              <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-[460px]">
                <div
                  className="relative flex-1 rounded-2xl"
                  style={{ background: "#FFFFFF", border: `1.5px solid ${CLR_BORDER}`, boxShadow: "0 2px 12px rgba(37,99,235,0.08)" }}
                >
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: CLR_SUBTLE }} />
                  <input
                    type="text"
                    placeholder="Cari model, brand, atau spesifikasi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 text-sm outline-none bg-transparent rounded-2xl placeholder:text-[#94A3B8]"
                    style={{ color: CLR_TEXT }}
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 rounded-2xl text-sm font-semibold text-[#0F172A] flex-shrink-0 transition hover:brightness-110 active:scale-95"
                  style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 20px rgba(37,99,235,0.35)" }}
                >
                  Cari
                </button>
              </form>

              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {[
                  { icon: <Shield size={13} />, text: "Teknisi Tersertifikasi" },
                  { icon: <CheckCircle size={13} />, text: "Escrow aman" },
                  { icon: <Award size={13} />, text: "Laporan Inspeksi Digital" },
                ].map(({ icon, text }) => (
                  <span key={text} className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: CLR_MUTED }}>
                    <span style={{ color: CLR_ACCENT }}>{icon}</span>
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right illustration ── */}
            <div className="order-1 lg:order-2 flex-shrink-0 relative flex items-center justify-center w-full">
              <div
                className="w-full max-w-sm aspect-[4/3] rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #FFFFFF 0%, #BFDBFE 100%)",
                  border: `1px solid ${CLR_BORDER}`,
                  boxShadow: "0 20px 60px -20px rgba(37,99,235,0.25)",
                }}
              >
                <svg width="50%" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.2" />
                  <rect x="4" y="5" width="16" height="10" rx="1" fill="#BFDBFE" />
                  <rect x="7" y="7" width="10" height="1.5" rx="0.75" fill="#3B82F6" opacity="0.6" />
                  <rect x="7" y="10" width="7" height="1.5" rx="0.75" fill="#3B82F6" opacity="0.4" />
                  <rect x="7" y="13" width="4" height="1" rx="0.5" fill="#3B82F6" opacity="0.3" />
                  <path d="M1 17h22l-1.5 3a1 1 0 01-.9.6H3.4a1 1 0 01-.9-.6L1 17z" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="1.2" />
                </svg>

                <div
                  className="absolute top-4 left-4 rounded-xl px-3 py-1.5 text-xs font-bold"
                  style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY, boxShadow: "0 4px 12px rgba(37,99,235,0.35)" }}
                >
                </div>

                <div
                  className="absolute bottom-4 right-4 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold"
                  style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}`, color: CLR_TEXT, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                >
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  4.9 Rating
                </div>
              </div>

              <div className="absolute -top-3 -right-3 lg:-right-1 lg:top-2">
                <GradientStamp size={76} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════ STATS ROW ══════════════════════ */}
      <section className={`${SECTION_X} py-6`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map(({ value, label, icon }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-2 px-6 py-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#EFF6FF]"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 4px 24px rgba(37,99,235,0.06)" }}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-1"
                style={{ background: GRAD_PRIMARY, boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}
              >
                {icon}
              </span>
              <p
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: FONT_DISPLAY, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
              >
                {value}
              </p>
              <p className="text-xs text-center" style={{ color: CLR_MUTED }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ LAPTOP TERBARU ═════════════════ */}
      <section className={`${SECTION_X} ${SECTION_Y}`}>

        <div className="flex items-end justify-between mb-7 pb-5 gap-4" style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}>
          <div>
            <SectionLabel icon={<Sparkles size={11} />} text="Koleksi Terbaru" />
            <h2 className="text-2xl" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
              Laptop Terbaru
            </h2>
          </div>
          <button
            onClick={() => navigate("/laptop")}
            className="flex items-center gap-1.5 text-xs font-semibold transition hover:gap-2.5 flex-shrink-0"
            style={{ color: "#1D4ED8" }}
          >
            Lihat Semua <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl"
            style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}` }}
          >
            <ShoppingBag size={40} style={{ color: CLR_SUBTLE }} className="mb-3" />
            <p className="text-sm" style={{ color: CLR_MUTED }}>Belum ada produk tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/laptop/${p.slug}`)}
                className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
                style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = CLR_ACCENT;
                  e.currentTarget.style.boxShadow = "0 16px 40px -10px rgba(37,99,235,0.28)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = CLR_BORDER;
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                <div
                  className="relative h-44 flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{ background: "linear-gradient(160deg, #DBEAFE 0%, #BFDBFE 100%)", borderBottom: `1px solid ${CLR_BORDER}` }}
                >
                  {p.status === "available" && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <GradientStamp size={52} />
                    </div>
                  )}
                  {p.primary_image ? (
                    <img src={p.primary_image} alt={p.model} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <ShoppingBag size={36} style={{ color: CLR_SUBTLE }} />
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm line-clamp-1 mb-1" style={{ color: CLR_TEXT }}>
                    {p.brand?.name} {p.model}
                  </h3>
                  <p className="text-[11px] line-clamp-1 mb-3" style={{ color: CLR_MUTED }}>
                    {[p.cpu, p.ram && `${p.ram}GB RAM`, p.storage && `${p.storage}GB SSD`].filter(Boolean).join(" · ")}
                  </p>
                  <p
                    className="text-base font-bold mb-3 mt-auto"
                    style={{ fontFamily: FONT_DISPLAY, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                  >
                    Rp {Number(p.price).toLocaleString("id-ID")}
                  </p>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-[11px] font-medium" style={{ color: CLR_TEXT }}>
                        {p.avg_rating > 0 ? p.avg_rating : "–"}
                      </span>
                      {p.rating_count > 0 && (
                        <span className="text-[11px]" style={{ color: CLR_MUTED }}>({p.rating_count})</span>
                      )}
                    </div>
                    <button
                      className="transition"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Simpan ke favorit"
                      style={{ color: CLR_SUBTLE }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = CLR_ACCENT)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = CLR_SUBTLE)}
                    >
                      <Heart size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="mt-9 text-center">
            <button
              onClick={() => navigate("/laptop")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition hover:brightness-110 active:scale-95"
              style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY, boxShadow: "0 4px 20px rgba(37,99,235,0.30)" }}
            >
              Lihat Semua Laptop <ArrowRight size={15} />
            </button>
          </div>
        )}

      </section>

      {/* ══════════════════ KEUNGGULAN ═════════════════════ */}
      <section
        className={SECTION_Y}
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(238,242,255,0.6) 50%, transparent 100%)" }}
      >
        <div className={SECTION_X}>
          <SectionHeader
            label={{ icon: <Sparkles size={11} />, text: "Kenapa Kami" }}
            title="Belanja Tanpa"
            accentWord="Khawatir"
            desc="Setiap langkah dirancang supaya transaksi laptop bekas terasa aman, transparan, dan nyaman seperti beli baru."
            align="center"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon, title, desc, accent }) => (
              <div
                key={title}
                className="rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2"
                style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accent;
                  e.currentTarget.style.boxShadow = `0 16px 40px -10px ${accent}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = CLR_BORDER_LT;
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)";
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4"
                  style={{ background: accent, boxShadow: `0 6px 18px ${accent}40` }}
                >
                  {icon}
                </div>
                <h4 className="font-semibold text-sm mb-2 whitespace-nowrap" style={{ color: CLR_TEXT }}>{title}</h4>
                <p className="text-[12px] leading-relaxed" style={{ color: CLR_MUTED }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CARA KERJA ══════════════════════ */}
      <section className={`${SECTION_X} ${SECTION_Y}`}>
        <SectionHeader
          label={{ icon: <PlayCircle size={11} />, text: "Proses Mudah" }}
          labelColor="#0891B2" labelBg="rgba(8,145,178,0.08)" labelBorder="rgba(8,145,178,0.20)"
          title="Cara Kerja"
          accentWord="LapNesia"
          desc="Dari mencari sampai laptop di tangan, hanya empat langkah sederhana."
          align="center"
        />

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* connecting line for desktop */}
          <div
            className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px"
            style={{ background: "linear-gradient(90deg, transparent, #BFDBFE 15%, #BFDBFE 85%, transparent)" }}
          />
          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="relative flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold mb-4 relative z-10"
                style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY, boxShadow: "0 6px 18px rgba(37,99,235,0.28)" }}
              >
                {num}
              </div>
              <h4 className="font-semibold text-sm mb-2" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>{title}</h4>
              <p className="text-[12px] leading-relaxed max-w-[200px]" style={{ color: CLR_MUTED }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ TESTIMONI ══════════════════════ */}
      <section className={`${SECTION_X} ${SECTION_Y}`}>
        <SectionHeader
          label={{ icon: <Quote size={11} />, text: "Testimoni" }}
          labelColor="#0891B2" labelBg="rgba(8,145,178,0.08)" labelBorder="rgba(8,145,178,0.20)"
          title="Apa Kata"
          accentWord="Pembeli"
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ name, role, initial, quote, rating }) => (
            <div
              key={name}
              className="rounded-2xl p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden"
              style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #ECFEFF 100%)", border: "1px solid #CFFAFE", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0891B2";
                e.currentTarget.style.boxShadow = "0 16px 40px -10px rgba(8,145,178,0.20)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#CFFAFE";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)";
              }}
            >
              <Quote size={36} className="absolute top-4 right-4 opacity-[0.07]" style={{ color: "#0891B2" }} />

              <div className="flex gap-0.5 mb-4">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-[13px] italic leading-relaxed flex-1 mb-5 relative" style={{ color: "#475569" }}>
                "{quote}"
              </p>

              <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: GRAD_PRIMARY, boxShadow: "0 4px 10px rgba(37,99,235,0.25)" }}
                >
                  {initial}
                </div>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: CLR_TEXT }}>{name}</p>
                  <p className="text-[11px]" style={{ color: CLR_MUTED }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ CTA BANNER ═════════════════════ */}
      <section className={`${SECTION_X} pb-16`}>
        <div
          className="rounded-3xl px-6 sm:px-10 md:px-16 py-14 text-center relative overflow-hidden"
          style={{ background: GRAD_CTA_BG, border: `1px solid ${CLR_BORDER}`, boxShadow: "0 8px 40px rgba(37,99,235,0.10)" }}
        >
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#06B6D4" }} />

          <div className="relative z-10 flex flex-col items-center">
            <SectionLabel icon={<Zap size={11} />} text="Mulai Sekarang" />
            <h2 className="text-2xl md:text-4xl mb-4 max-w-xl" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}>
              Siap Pakai Laptop Baru,{" "}
              <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Hari Ini?
              </span>
            </h2>
            <p className="text-sm max-w-md mx-auto mb-8 leading-relaxed" style={{ color: CLR_MUTED }}>
              Jelajahi ratusan laptop bekas terverifikasi dengan laporan inspeksi lengkap dan harga terbaik di LapNesia.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/laptop")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold text-[#0F172A] transition hover:brightness-110 active:scale-95"
                style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 6px 24px rgba(37,99,235,0.35)" }}
              >
                <ShoppingBag size={16} /> Mulai Belanja
              </button>
              <button
                onClick={() => navigate("/about")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold transition hover:bg-[#EFF6FF]"
                style={{ color: CLR_ACCENT, border: `1.5px solid ${CLR_BORDER}`, background: "#FFFFFF", fontFamily: FONT_DISPLAY }}
              >
                Pelajari Lebih Lanjut <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}