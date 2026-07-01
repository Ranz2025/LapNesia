import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Archive, ExternalLink, Package, Sparkles, RefreshCw } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getSellerProducts, archiveProduct } from "../../services/productService";
import { toast } from "../../components/ui/Toast";
import { CardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

/* ─── DESIGN TOKENS (shared across all pages) ─────────────── */
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

const STATUS_STYLE = {
  active:   { background: "rgba(5,150,105,0.10)",  color: "#059669", border: "rgba(5,150,105,0.25)" },
  pending:  { background: "rgba(217,119,6,0.10)",  color: "#D97706", border: "rgba(217,119,6,0.25)" },
  draft:    { background: "rgba(100,116,139,0.10)", color: CLR_MUTED, border: "rgba(100,116,139,0.20)" },
  booked:   { background: "rgba(37,99,235,0.10)",  color: CLR_ACCENT, border: "rgba(37,99,235,0.25)" },
  sold:     { background: "rgba(37,99,235,0.10)",  color: CLR_ACCENT, border: "rgba(37,99,235,0.25)" },
  archived: { background: "rgba(239,68,68,0.10)",   color: "#DC2626", border: "rgba(239,68,68,0.25)" },
};

const STATUS_LABELS = {
  active: "Aktif", pending: "Menunggu", draft: "Draft",
  booked: "Dipesan", sold: "Terjual", archived: "Diarsipkan",
};

const STATUS_FILTERS = [
  { id: "all", label: "Semua" },
  { id: "active", label: "Aktif" },
  { id: "pending", label: "Menunggu" },
  { id: "booked", label: "Dipesan" },
  { id: "sold", label: "Terjual" },
  { id: "archived", label: "Diarsipkan" },
];

const unwrapData = (payload) => {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return data?.data ?? data ?? [];
};

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

export default function MyProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [archiving, setArchiving] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async (isRefresh) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await getSellerProducts();
      setProducts(unwrapData(res));
    } catch {
      toast.error("Gagal memuat produk. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleArchive = async (id, model) => {
    if (!window.confirm(`Arsipkan produk "${model}"? Produk tidak akan tampil di pencarian.`)) return;
    setArchiving(id);
    try {
      await archiveProduct(id);
      toast.success("Produk berhasil diarsipkan.");
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: "archived" } : p));
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengarsipkan produk.");
    } finally {
      setArchiving(null);
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return counts;
  }, [products]);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.model?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              Produk{" "}
              <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Saya
              </span>
            </h1>
            <p className="text-sm" style={{ color: CLR_MUTED }}>
              {products.length} produk terdaftar di tokomu.
            </p>
          </div>

          <div className="relative flex gap-2 flex-shrink-0">
            <button
              onClick={() => fetchProducts(true)}
              className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}`, color: CLR_MUTED }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = CLR_ACCENT)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = CLR_BORDER)}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Memperbarui..." : "Refresh"}
            </button>
            <button
              onClick={() => navigate("/seller/add-product")}
              className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition hover:brightness-110 active:scale-95"
              style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY, boxShadow: "0 4px 16px rgba(37,99,235,0.30)" }}
            >
              <Plus size={15} /> Tambah Produk
            </button>
          </div>
        </div>

        {/* ── Search & status filter toolbar ── */}
        <div
          className="rounded-2xl p-4 sm:p-5 mb-6"
          style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 12px rgba(37,99,235,0.06)" }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: CLR_SUBTLE }} />
            <input
              type="text"
              placeholder="Cari berdasarkan model atau brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 outline-none rounded-xl placeholder:text-[#94A3B8] text-sm transition-all"
              style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
              onFocus={(e) => (e.target.style.borderColor = CLR_ACCENT)}
              onBlur={(e) => (e.target.style.borderColor = CLR_BORDER_LT)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Package style={{ color: CLR_SUBTLE }} size={48} />}
            title={search || statusFilter !== "all" ? "Tidak ada produk yang cocok" : "Belum ada produk"}
            description={search || statusFilter !== "all" ? "Coba kata kunci atau filter lain." : "Mulai jual laptop Anda sekarang."}
            action={!search && statusFilter === "all" ? { label: "Tambah Produk", onClick: () => navigate("/seller/add-product") } : null}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
            {filtered.map((product) => {
              const statusStyle = STATUS_STYLE[product.status] || STATUS_STYLE.draft;
              const editDisabled = ["booked", "paid", "sold"].includes(product.status);
              return (
                <div
                  key={product.id}
                  className="rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full"
                  style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = CLR_ACCENT; e.currentTarget.style.boxShadow = "0 12px 28px -10px rgba(37,99,235,0.22)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
                >
                  {/* Image */}
                  <div
                    className="relative h-40 flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{ background: "linear-gradient(160deg, #DBEAFE 0%, #BFDBFE 100%)", borderBottom: `1px solid ${CLR_BORDER}` }}
                  >
                    <span
                      className="absolute top-2.5 right-2.5 z-10 text-[10px] px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: statusStyle.background, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
                    >
                      {STATUS_LABELS[product.status] || product.status}
                    </span>
                    {/* Badge Habis jika stok 0 */}
                    {(product.stock === 0 || product.is_out_of_stock) && (
                      <span
                        className="absolute top-2.5 left-2.5 z-10 text-[10px] px-2.5 py-1 rounded-full font-bold"
                        style={{ background: "rgba(239,68,68,0.92)", color: "#fff" }}
                      >
                        Habis
                      </span>
                    )}
                    {product.primary_image || product.images?.[0]?.image_url ? (
                      <img
                        src={product.primary_image || product.images[0].image_url}
                        alt={product.model}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package style={{ color: CLR_SUBTLE }} size={40} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: CLR_MUTED }}>
                      {product.brand?.name}
                    </p>
                    <h3 className="font-semibold text-sm line-clamp-1 mb-1" style={{ color: CLR_TEXT }}>
                      {product.model}
                    </h3>

                    {/* Stok info */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[11px] font-medium" style={{ color: CLR_MUTED }}>Stok:</span>
                      <span
                        className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: (product.stock ?? 0) > 0 ? "rgba(5,150,105,0.10)" : "rgba(239,68,68,0.10)",
                          color: (product.stock ?? 0) > 0 ? "#059669" : "#DC2626",
                        }}
                      >
                        {product.stock ?? 0} unit
                      </span>
                      {product.inspection_ready && (
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1"
                          style={{ background: "rgba(37,99,235,0.08)", color: CLR_ACCENT, border: "1px solid rgba(37,99,235,0.20)" }}
                        >
                          ✓ Siap Inspeksi
                        </span>
                      )}
                    </div>

                    <p
                      className="text-base font-bold mb-3 mt-auto"
                      style={{ fontFamily: FONT_DISPLAY, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                    >
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
                      <button
                        onClick={() => navigate(`/seller/edit-product/${product.id}`)}
                        disabled={editDisabled}
                        title={editDisabled ? "Tidak dapat diedit saat status ini" : "Edit produk"}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.25)", color: CLR_ACCENT }}
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => navigate(`/laptop/${product.slug}`)}
                        title="Lihat di katalog"
                        className="flex items-center justify-center px-2.5 py-2 rounded-xl transition"
                        style={{ background: "#F8FAFC", border: `1px solid ${CLR_BORDER_LT}`, color: CLR_MUTED }}
                      >
                        <ExternalLink size={12} />
                      </button>
                      {product.status !== "archived" && !["booked", "paid"].includes(product.status) && (
                        <button
                          onClick={() => handleArchive(product.id, product.model)}
                          disabled={archiving === product.id}
                          className="flex items-center justify-center px-2.5 py-2 rounded-xl transition disabled:opacity-40"
                          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", color: "#DC2626" }}
                          title="Arsipkan"
                        >
                          {archiving === product.id ? (
                            <span className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: "#DC2626", borderTopColor: "transparent" }} />
                          ) : (
                            <Archive size={12} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}