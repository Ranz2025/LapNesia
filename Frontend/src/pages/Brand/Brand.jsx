import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, RefreshCw, Star, Heart, Sparkles, Tag } from "lucide-react";
import { getAllProducts } from "../../services/productService";
import { CardSkeleton } from "../../components/ui/Skeleton";

/* ─── DESIGN TOKENS (sama dengan Home.jsx) ──────────────────── */
const FONT_DISPLAY  = "'Baloo 2', sans-serif";
const FONT_BODY     = "'Inter', sans-serif";
const GRAD_PRIMARY  = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
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
          <linearGradient id="sgBrand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#2563EB" />
            <stop offset="50%"  stopColor="#0891B2" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="url(#sgBrand)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#sgBrand)" strokeWidth="1" strokeDasharray="2 3" />
        <path d="M33 52 L45 64 L68 39" fill="none" stroke="url(#sgBrand)"
              strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="80" textAnchor="middle" fontSize="7" fill="#0EA5E9"
              fontWeight="700" letterSpacing="0.5">LULUS CEK</text>
      </svg>
    </div>
  );
}

/* ─── BRAND LOGO PLACEHOLDER ────────────────────────────────── */
function BrandIcon({ name }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
      style={{ background: GRAD_PRIMARY }}
    >
      {initials}
    </div>
  );
}

const BRANDS = ["ASUS", "Acer", "Lenovo", "Dell", "HP", "Apple"];

function Brand() {
  const navigate  = useNavigate();
  const [brand, setBrand]     = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true); setError(null);
      const res  = await getAllProducts({});
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setProducts(list);
    } catch { setError("Gagal memuat produk."); }
    finally  { setLoading(false); }
  };

  const brandStr = (b) => (typeof b === "string" ? b : b?.name || "");

  const filtered =
    brand === ""
      ? products
      : products.filter((p) => brandStr(p.brand).toLowerCase() === brand.toLowerCase());

  return (
    <div style={{ fontFamily: FONT_BODY }}>

      {/* ── Page Header ── */}
      <div className={`${SECTION_X} pt-10 pb-6`}>
        <span
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-4"
          style={{ color: CLR_ACCENT, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)" }}
        >
          <Tag size={11} /> Jelajahi per merek
        </span>
        <h1
          className="text-3xl md:text-4xl mb-2 leading-tight"
          style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}
        >
          Brand{" "}
          <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Laptop
          </span>
        </h1>
        <p className="text-sm max-w-lg" style={{ color: CLR_MUTED }}>
          Temukan laptop bekas dari berbagai brand terpercaya — setiap unit telah diinspeksi 25 titik.
        </p>
      </div>

      {/* ── Brand Filter Pills ── */}
      <div className={`${SECTION_X} pb-6`}>
        <div
          className="rounded-2xl p-4 flex gap-2 flex-wrap"
          style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 12px rgba(37,99,235,0.06)" }}
        >
          {["Semua Brand", ...BRANDS].map((item) => {
            const val     = item === "Semua Brand" ? "" : item;
            const active  = brand === val;
            return (
              <button
                key={item}
                onClick={() => setBrand(val)}
                className="flex items-center gap-2 pl-2.5 pr-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={
                  active
                    ? { background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY, boxShadow: "0 4px 14px rgba(37,99,235,0.30)" }
                    : { background: "#F8FAFC", color: CLR_TEXT, border: `1px solid ${CLR_BORDER_LT}`, fontFamily: FONT_DISPLAY }
                }
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = CLR_ACCENT; e.currentTarget.style.background = "#EFF6FF"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.background = "#F8FAFC"; } }}
              >
                {val && <BrandIcon name={val} />}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Result Info ── */}
      <div className={SECTION_X}>
        <div
          className="flex items-center justify-between flex-wrap gap-2 pb-5 mb-6"
          style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}
        >
          <p className="text-xs min-h-[1em]" style={{ color: CLR_MUTED }}>
            {!loading && !error && (
              <>
                Menampilkan{" "}
                <span className="font-semibold" style={{ color: CLR_TEXT }}>{filtered.length}</span>{" "}
                laptop{brand ? ` dari ${brand}` : ""}
              </>
            )}
          </p>
          <div className="flex items-center gap-1.5 text-xs flex-shrink-0" style={{ color: CLR_MUTED }}>
            <Sparkles size={12} style={{ color: CLR_ACCENT }} />
          </div>
        </div>

        {/* ── States ── */}
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
              onClick={fetchProducts}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0F172A] transition hover:brightness-110"
              style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}
            >
              <RefreshCw size={14} /> Coba Lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center text-center py-20 rounded-2xl mb-16"
            style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}` }}
          >
            <ShoppingBag size={40} className="mb-3" style={{ color: CLR_SUBTLE }} />
            <p className="text-sm mb-2" style={{ color: CLR_MUTED }}>
              Tidak ada produk untuk brand {brand || "ini"}
            </p>
            {brand && (
              <button
                onClick={() => setBrand("")}
                className="text-xs font-semibold hover:underline"
                style={{ color: CLR_ACCENT }}
              >
                Lihat semua brand
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-16 items-stretch">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/laptop/${p.slug}`)}
                className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
                style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = CLR_ACCENT;
                  e.currentTarget.style.boxShadow   = "0 16px 40px -10px rgba(37,99,235,0.28)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = CLR_BORDER;
                  e.currentTarget.style.boxShadow   = "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                {/* Thumbnail */}
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
                    <img src={p.primary_image} alt={p.model}
                         className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <ShoppingBag size={36} style={{ color: CLR_SUBTLE }} />
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: CLR_MUTED }}>
                    {brandStr(p.brand)}
                  </p>
                  <h3 className="font-semibold text-sm line-clamp-1 mb-1" style={{ color: CLR_TEXT }}>
                    {p.model || p.name}
                  </h3>
                  <p className="text-[11px] line-clamp-1 mb-3" style={{ color: CLR_MUTED }}>
                    {[p.cpu, p.ram && `${p.ram}GB RAM`, p.storage && `${p.storage}GB SSD`].filter(Boolean).join(" · ")}
                  </p>
                  <p
                    className="text-base font-bold mb-3 mt-auto"
                    style={{ fontFamily: FONT_DISPLAY, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                  >
                    Rp {Number(p.price || 0).toLocaleString("id-ID")}
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
      </div>
    </div>
  );
}

export default Brand;