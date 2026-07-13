import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search, ShoppingBag, Star, CheckCircle, RefreshCw,
  SlidersHorizontal, Heart, X, Sparkles, Shield, Zap, ArrowRight
} from "lucide-react";
import { getAllProducts } from "../../services/productService";
import { CardSkeleton } from "../../components/ui/Skeleton";
import api from "../../services/api";

/* ─── DESIGN TOKENS (shared with Home) ─────────────────────── */
const FONT_DISPLAY  = "'Baloo 2', sans-serif";
const FONT_BODY     = "'Inter', sans-serif";
const GRAD_PRIMARY  = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG  = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const GRAD_CARD_BG  = "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)";
const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

/* ─── STAMP ─────────────────────────────────────────────────── */
function GradientStamp({ size = 52 }) {
  return (
    <div style={{ width: size, height: size, transform: "rotate(-12deg)" }}
         className="select-none flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="sgLaptop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#2563EB" />
            <stop offset="50%"  stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="url(#sgLaptop)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#sgLaptop)" strokeWidth="1" strokeDasharray="2 3" />
        <path d="M33 52 L45 64 L68 39" fill="none" stroke="url(#sgLaptop)"
              strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="80" textAnchor="middle" fontSize="7" fill="#0EA5E9"
              fontWeight="700" letterSpacing="0.5">LULUS CEK</text>
      </svg>
    </div>
  );
}

function SectionLabel({ icon, text, color = "#2563EB", bg = "rgba(37,99,235,0.08)", border = "rgba(37,99,235,0.20)" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-3"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {icon} {text}
    </span>
  );
}

/* Sort options encode something real: how the buyer wants to weigh price vs trust */
const SORT_OPTIONS = [
  { id: "newest", label: "Terbaru" },
  { id: "price_asc", label: "Harga Terendah" },
  { id: "price_desc", label: "Harga Tertinggi" },
  { id: "rating", label: "Rating Tertinggi" },
];

export default function Laptop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [brands, setBrands]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState(searchParams.get("search") || "");
  const [brand, setBrand]       = useState("");
  const [sort, setSort]         = useState("newest");

  useEffect(() => {
    api.get("/v1/brands").then((r) => setBrands(r.data?.data || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [brand]);

  const fetchProducts = async (q) => {
    setLoading(true); setError(null);
    try {
      const filters = {};
      const q2 = q !== undefined ? q : search;
      if (q2)    filters.search = q2;
      if (brand) filters.brand  = brand;
      const res = await getAllProducts(filters);
      setProducts(res.data || []);
    } catch { setError("Gagal memuat produk."); }
    finally   { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchProducts(search); };
  const reset = () => { setSearch(""); setBrand(""); setSort("newest"); fetchProducts(""); };

  const hasActiveFilter = Boolean(search || brand);

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "price_asc")  return Number(a.price) - Number(b.price);
    if (sort === "price_desc") return Number(b.price) - Number(a.price);
    if (sort === "rating")     return (b.avg_rating || 0) - (a.avg_rating || 0);
    return 0;
  });

  return (
    <div style={{ fontFamily: FONT_BODY }}>

      {/* ══════════════ AMBIENT GLOW BACKDROP ══════════════ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-25 blur-[130px]"
             style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-20 blur-[130px]"
             style={{ background: "#67E8F9" }} />
      </div>

      {/* ══════════════════ HERO / CATALOG HEADER ══════════════════ */}
      <section className={`${SECTION_X} pt-8 pb-6`}>
        <div
          className="rounded-3xl overflow-hidden relative px-6 sm:px-10 md:px-14 py-10 md:py-12"
          style={{ background: GRAD_HERO_BG, border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
               style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
               style={{ background: "#06B6D4" }} />

          <div className="relative max-w-2xl">
            <SectionLabel icon={<Sparkles size={11} />} text="Semua unit dapat diinspeksi oleh teknisi tersertifikasi" />
            <h1
              className="text-3xl md:text-4xl mb-3 leading-tight"
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}
            >
              Jelajahi Laptop{" "}
              <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Terbaik
              </span>
            </h1>
            <p className="text-sm leading-relaxed mb-7 max-w-lg" style={{ color: CLR_MUTED }}>
              Temukan berbagai pilihan laptop yang dapat diinspeksi oleh teknisi tersertifikasi,
              sehingga kamu dapat berbelanja dengan lebih percaya diri.
            </p>

            {/* Search row */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
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
              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-7 rounded-2xl text-sm font-semibold text-[#0F172A] transition hover:brightness-110 active:scale-95 py-3.5 sm:py-0"
                  style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 20px rgba(37,99,235,0.35)" }}
                >
                  Cari
                </button>
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={reset}
                    className="p-3.5 rounded-2xl transition flex-shrink-0"
                    style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}` }}
                    title="Reset filter"
                  >
                    <RefreshCw size={15} style={{ color: CLR_MUTED }} />
                  </button>
                )}
              </div>
            </form>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6">
              {[
                { icon: <Shield size={13} />, text: "Teknisi tersertifikasi" },
                { icon: <CheckCircle size={13} />, text: "Escrow aman" },
              ].map(({ icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: CLR_MUTED }}>
                  <span style={{ color: CLR_ACCENT }}>{icon}</span>
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute top-6 right-6 hidden md:block">
            <GradientStamp size={70} />
          </div>
        </div>
      </section>

      {/* ══════════════════ FILTER TOOLBAR ══════════════════ */}
      <div className={`${SECTION_X} pb-5`}>
        <div
          className="rounded-2xl p-4 sm:p-5"
          style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 12px rgba(37,99,235,0.06)" }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Brand pills */}
            {brands.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[{ id: "", slug: "", name: "Semua" }, ...brands].map((b) => {
                  const active = brand === b.slug;
                  return (
                    <button
                      key={b.id || "all"}
                      onClick={() => setBrand(b.slug)}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                      style={
                        active
                          ? { background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY, boxShadow: "0 2px 10px rgba(37,99,235,0.25)" }
                          : { background: "#F8FAFC", color: CLR_TEXT, border: `1px solid ${CLR_BORDER_LT}` }
                      }
                      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = CLR_ACCENT; e.currentTarget.style.background = "#EFF6FF"; } }}
                      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.background = "#F8FAFC"; } }}
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sort dropdown */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <SlidersHorizontal size={13} style={{ color: CLR_MUTED }} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs font-semibold rounded-lg px-3 py-2 outline-none cursor-pointer"
                style={{ background: "#F8FAFC", border: `1px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Chips + Count ── */}
      <div className={SECTION_X}>
        {hasActiveFilter && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs flex items-center gap-1" style={{ color: CLR_MUTED }}>
              <SlidersHorizontal size={12} /> Filter aktif:
            </span>
            {search && (
              <span
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                style={{ background: "rgba(37,99,235,0.10)", color: "#1D4ED8", border: "1px solid rgba(37,99,235,0.25)" }}
              >
                "{search}"
                <button onClick={() => { setSearch(""); fetchProducts(""); }} aria-label="Hapus filter search">
                  <X size={11} />
                </button>
              </span>
            )}
            {brand && (
              <span
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                style={{ background: "rgba(37,99,235,0.10)", color: "#2563EB", border: "1px solid rgba(37,99,235,0.25)" }}
              >
                {brands.find((b) => b.slug === brand)?.name || brand}
                <button onClick={() => setBrand("")} aria-label="Hapus filter brand">
                  <X size={11} />
                </button>
              </span>
            )}
          </div>
        )}

        {!loading && !error && sortedProducts.length > 0 && (
          <p className="text-xs mb-5" style={{ color: CLR_MUTED }}>
            Menampilkan{" "}
            <span className="font-semibold" style={{ color: CLR_TEXT }}>{sortedProducts.length}</span>{" "}
            produk
          </p>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-16">
            {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div
            className="flex flex-col items-center text-center py-20 rounded-2xl mb-16"
            style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}` }}
          >
            <p className="text-sm mb-4" style={{ color: CLR_MUTED }}>{error}</p>
            <button
              onClick={() => fetchProducts()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0F172A] transition hover:brightness-110"
              style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}
            >
              <RefreshCw size={14} /> Coba Lagi
            </button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div
            className="flex flex-col items-center text-center py-20 rounded-2xl mb-16"
            style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}` }}
          >
            <ShoppingBag size={40} className="mb-3" style={{ color: CLR_SUBTLE }} />
            <p className="text-sm font-medium mb-2" style={{ color: CLR_MUTED }}>Tidak ada produk ditemukan</p>
            {hasActiveFilter && (
              <button
                onClick={reset}
                className="text-xs font-semibold hover:underline"
                style={{ color: CLR_ACCENT }}
              >
                Reset filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-16 items-stretch">
            {sortedProducts.map((p) => {
              const isSold = p.is_sold || p.status === "sold";
              return (
              <div
                key={p.id}
                onClick={() => !isSold && navigate(`/laptop/${p.slug}`)}
                className={`group rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full ${isSold ? "opacity-75 cursor-not-allowed" : "cursor-pointer hover:-translate-y-2"}`}
                style={{ background: GRAD_CARD_BG, border: `1px solid ${isSold ? CLR_BORDER_LT : CLR_BORDER}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                onMouseEnter={(e) => {
                  if (isSold) return;
                  e.currentTarget.style.borderColor = CLR_ACCENT;
                  e.currentTarget.style.boxShadow   = "0 16px 40px -10px rgba(37,99,235,0.28)";
                }}
                onMouseLeave={(e) => {
                  if (isSold) return;
                  e.currentTarget.style.borderColor = CLR_BORDER;
                  e.currentTarget.style.boxShadow   = "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                {/* Thumbnail */}
                <div
                  className="relative h-44 flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{ background: "linear-gradient(160deg, #DBEAFE 0%, #BFDBFE 100%)", borderBottom: `1px solid ${CLR_BORDER}` }}
                >
                  {/* Overlay Habis */}
                  {isSold && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center"
                         style={{ background: "rgba(15,23,42,0.45)" }}>
                      <span
                        className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                        style={{ background: "rgba(239,68,68,0.90)", color: "#fff", letterSpacing: "0.1em" }}
                      >
                        Habis
                      </span>
                    </div>
                  )}
                  {!isSold && p.status === "available" && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <GradientStamp size={52} />
                    </div>
                  )}
                  {p.latest_inspection_report && !p.latest_inspection_report.is_expired && (
                    <div
                      className="absolute bottom-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: "rgba(16,185,129,0.15)", color: "#059669", border: "1px solid rgba(16,185,129,0.30)" }}
                    >
                      <CheckCircle size={10} /> Inspeksi valid
                    </div>
                  )}
                  {p.primary_image ? (
                    <img src={p.primary_image} alt={p.model}
                         className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <ShoppingBag size={36} style={{ color: CLR_SUBTLE }} />
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: CLR_MUTED }}>
                    {p.brand?.name}
                  </p>
                  <h3 className="font-semibold text-sm line-clamp-1 mb-1" style={{ color: isSold ? CLR_MUTED : CLR_TEXT }}>
                    {p.model}
                  </h3>
                  <p className="text-[11px] line-clamp-1 mb-3" style={{ color: CLR_SUBTLE }}>
                    {[p.cpu, p.ram && `${p.ram}GB RAM`, p.storage && `${p.storage}GB SSD`].filter(Boolean).join(" · ")}
                  </p>
                  {isSold ? (
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full mb-3 mt-auto inline-block w-fit"
                      style={{ background: "rgba(239,68,68,0.10)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.20)" }}
                    >
                      Terjual
                    </span>
                  ) : (
                    <p
                      className="text-base font-bold mb-3 mt-auto"
                      style={{ fontFamily: FONT_DISPLAY, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                    >
                      Rp {Number(p.price).toLocaleString("id-ID")}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
                    <div className="flex items-center gap-1">
                      <Star size={12} className={isSold ? "fill-gray-300 text-gray-300" : "fill-yellow-400 text-yellow-400"} />
                      <span className="text-[11px] font-medium" style={{ color: isSold ? CLR_SUBTLE : CLR_TEXT }}>
                        {p.avg_rating > 0 ? p.avg_rating : "–"}
                      </span>
                      {p.rating_count > 0 && (
                        <span className="text-[11px]" style={{ color: CLR_SUBTLE }}>({p.rating_count})</span>
                      )}
                    </div>
                    {!isSold && (
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
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════ MINI CTA (escrow trust reminder) ═════════════════ */}
        {!loading && sortedProducts.length > 0 && (
          <div
            className="rounded-3xl px-6 sm:px-10 py-8 text-center relative overflow-hidden mb-16"
            style={{
              background: "radial-gradient(ellipse at 20% 20%, rgba(37,99,235,0.10) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.10) 0%, transparent 60%), linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)",
              border: `1px solid ${CLR_BORDER}`,
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <span className="flex items-center gap-2 text-sm font-medium" style={{ color: CLR_MUTED }}>
                <Zap size={15} style={{ color: CLR_ACCENT }} />
                Tidak menemukan yang kamu cari? Lihat semua brand yang tersedia.
              </span>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0F172A] transition hover:brightness-110 active:scale-95 flex-shrink-0"
                style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 16px rgba(37,99,235,0.30)" }}
              >
                Lihat Semua <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}