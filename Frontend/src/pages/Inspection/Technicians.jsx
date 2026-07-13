import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getTechnicians } from "../../services/inspectionService";
import {
  Star, MapPin, Briefcase, RefreshCw, Sparkles, Shield, Users,
  Search, ArrowUpDown, Wallet, Award, X,
} from "lucide-react";

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";
const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO    = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const GRAD_CARD    = "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)";
const CLR_TEXT     = "#0F172A";
const CLR_MUTED    = "#64748B";
const CLR_SUBTLE   = "#94A3B8";
const CLR_BORDER   = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT   = "#2563EB";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

const SORT_OPTIONS = [
  { value: "rating", label: "Rating Tertinggi" },
  { value: "jobs", label: "Paling Berpengalaman" },
  { value: "fee_low", label: "Biaya Terendah" },
  { value: "name", label: "Nama (A-Z)" },
];

const normalizeTechnicians = (response) => {
  const root = response?.data;
  const data = Array.isArray(root?.data) ? root.data : Array.isArray(root) ? root : [];
  return data
    .filter((tech) => tech && (tech.status ? ["active", "verified"].includes(tech.status) : true))
    .map((tech) => ({
      ...tech,
      name:           tech.name || tech.user?.name || "",
      rating:         tech.rating_avg ?? tech.rating ?? 5.0,
      total_jobs:     tech.total_inspections ?? tech.total_jobs ?? 0,
      specialization: tech.skills ?? tech.specialization ?? "",
      location:       tech.location ?? tech.user?.city ?? "",
      inspection_fee: tech.inspection_fee ?? 0,
    }));
};

function SectionLabel({ icon, text }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold"
      style={{ color: CLR_ACCENT, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)" }}
    >
      {icon} {text}
    </span>
  );
}

/* Skeleton card */
function TechSkeleton() {
  return (
    <div className="rounded-2xl p-6 animate-pulse" style={{ background: GRAD_CARD, border: `1px solid ${CLR_BORDER}` }}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-[#BFDBFE] flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 rounded-full bg-[#BFDBFE] w-3/4" />
          <div className="h-3 rounded-full bg-[#E2E8F0] w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 rounded-full bg-[#E2E8F0] w-full" />
        <div className="h-3 rounded-full bg-[#E2E8F0] w-2/3" />
      </div>
      <div className="h-9 rounded-xl bg-[#BFDBFE]" />
    </div>
  );
}

export default function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("rating");
  const navigate  = useNavigate();
  const { state } = useLocation();
  const product_id   = state?.product_id;
  const product_slug = state?.product_slug;

  const fetchTechnicians = async () => {
    setRefreshing(true);
    try {
      const result = await getTechnicians();
      setTechnicians(normalizeTechnicians(result));
    } catch (err) {
      console.error(err);
      setTechnicians([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
    const onFocus = () => fetchTechnicians();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const topRatedId = useMemo(() => {
    if (technicians.length === 0) return null;
    return [...technicians].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.id;
  }, [technicians]);

  const filteredTechnicians = useMemo(() => {
    let list = technicians;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((t) =>
        t.name?.toLowerCase().includes(q) ||
        t.specialization?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    switch (sortBy) {
      case "jobs":
        sorted.sort((a, b) => (b.total_jobs || 0) - (a.total_jobs || 0));
        break;
      case "fee_low":
        sorted.sort((a, b) => (a.inspection_fee || 0) - (b.inspection_fee || 0));
        break;
      case "name":
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      default:
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted;
  }, [technicians, search, sortBy]);

  return (
    <div style={{ fontFamily: FONT_BODY }}>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#F0F9FF" }}>
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      {/* ── Page Header ── */}
      <section className={`${SECTION_X} pt-8 pb-6`}>
        <div
          className="rounded-3xl px-6 sm:px-8 md:px-14 py-12 relative overflow-hidden"
          style={{ background: GRAD_HERO, border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#0EA5E9" }} />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-7">
            <div>
              <SectionLabel icon={<Shield size={11} />} text="Teknisi Terverifikasi" />
              <h1
                className="text-3xl md:text-4xl mt-3 mb-2"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}
              >
                Pilih{" "}
                <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  Teknisi Inspeksi
                </span>
              </h1>
              <p className="text-sm max-w-md" style={{ color: CLR_MUTED }}>
                Pilih teknisi tersertifikasi untuk inspeksi menyeluruh pada laptop Anda.
              </p>
            </div>

            <button
              onClick={fetchTechnicians}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-110 active:scale-95 flex-shrink-0"
              style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY, boxShadow: "0 4px 16px rgba(37,99,235,0.30)" }}
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Memuat..." : "Refresh"}
            </button>
          </div>

          {/* ── Search + Sort bar ── */}
          <div className="relative flex flex-col sm:flex-row gap-3">
            <div
              className="relative flex-1 rounded-2xl"
              style={{ background: "#FFFFFF", border: `1.5px solid ${CLR_BORDER}`, boxShadow: "0 2px 12px rgba(37,99,235,0.08)" }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: CLR_SUBTLE }} />
              <input
                type="text"
                placeholder="Cari nama, keahlian, atau lokasi teknisi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-3 text-sm outline-none bg-transparent rounded-2xl placeholder:text-[#94A3B8]"
                style={{ color: CLR_TEXT }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: CLR_SUBTLE }}
                  aria-label="Hapus pencarian"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div
              className="relative flex items-center gap-2 rounded-2xl pl-4 pr-3"
              style={{ background: "#FFFFFF", border: `1.5px solid ${CLR_BORDER}`, boxShadow: "0 2px 12px rgba(37,99,235,0.08)" }}
            >
              <ArrowUpDown size={14} style={{ color: CLR_ACCENT, flexShrink: 0 }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-3 text-sm outline-none bg-transparent appearance-none pr-2 cursor-pointer"
                style={{ color: CLR_TEXT, fontFamily: FONT_BODY }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      {!loading && technicians.length > 0 && (
        <section className={`${SECTION_X} pb-6`}>
          <div
            className="flex flex-wrap items-center gap-6 px-6 py-4 rounded-2xl"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 12px rgba(37,99,235,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: GRAD_PRIMARY }}>
                <Users size={15} />
              </span>
              <div>
                <p className="text-sm font-bold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>{technicians.length}</p>
                <p className="text-[11px]" style={{ color: CLR_MUTED }}>Teknisi Aktif</p>
              </div>
            </div>
            <div className="w-px h-8 hidden sm:block" style={{ background: CLR_BORDER_LT }} />
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: GRAD_PRIMARY }}>
                <Sparkles size={15} />
              </span>
              <div>
                <p className="text-sm font-bold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>Tersertifikasi</p>
                <p className="text-[11px]" style={{ color: CLR_MUTED }}>Teknisi</p>
              </div>
            </div>
            {search && (
              <>
                <div className="w-px h-8 hidden sm:block" style={{ background: CLR_BORDER_LT }} />
                <p className="text-[12px]" style={{ color: CLR_MUTED }}>
                  Menampilkan <strong style={{ color: CLR_TEXT }}>{filteredTechnicians.length}</strong> hasil untuk "<strong style={{ color: CLR_TEXT }}>{search}</strong>"
                </p>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Grid ── */}
      <section className={`${SECTION_X} pb-16`}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <TechSkeleton key={i} />)}
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: GRAD_CARD, border: `1px solid ${CLR_BORDER}` }}
          >
            <Users size={40} className="mx-auto mb-3" style={{ color: CLR_SUBTLE }} />
            <p className="text-sm font-medium mb-1" style={{ color: CLR_MUTED }}>
              {search ? "Tidak ada teknisi yang cocok dengan pencarianmu" : "Belum ada teknisi tersedia saat ini"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs font-semibold mt-2 hover:underline"
                style={{ color: CLR_ACCENT }}
              >
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTechnicians.map((tech) => {
              const isTopRated = tech.id === topRatedId && (tech.rating || 0) >= 4.5;
              return (
                <div
                  key={tech.id}
                  className="relative rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
                  style={{ background: GRAD_CARD, border: `1px solid ${CLR_BORDER}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  onClick={() => navigate(`/technicians/${tech.id}`, { state: { product_id, product_slug } })}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = CLR_ACCENT; e.currentTarget.style.boxShadow = "0 16px 40px -10px rgba(37,99,235,0.25)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
                >
                  {isTopRated && (
                    <span
                      className="absolute -top-2.5 right-5 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white"
                      style={{ background: GRAD_PRIMARY, boxShadow: "0 4px 12px rgba(37,99,235,0.35)" }}
                    >
                      <Award size={11} /> Top Rated
                    </span>
                  )}

                  {/* Avatar + name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                      style={{ background: GRAD_PRIMARY, boxShadow: "0 4px 14px rgba(37,99,235,0.30)" }}
                    >
                      {tech.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
                        {tech.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={13} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold" style={{ color: CLR_TEXT }}>{tech.rating || "5.0"}</span>
                        <span className="text-xs" style={{ color: CLR_MUTED }}>({tech.total_jobs || 0} inspeksi)</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm mb-5" style={{ borderBottom: `1px solid ${CLR_BORDER_LT}`, paddingBottom: "1rem" }}>
                    {tech.specialization && (
                      <div className="flex items-center gap-2" style={{ color: CLR_MUTED }}>
                        <Briefcase size={14} style={{ color: CLR_ACCENT, flexShrink: 0 }} />
                        <span className="truncate">{tech.specialization}</span>
                      </div>
                    )}
                    {tech.location && (
                      <div className="flex items-center gap-2" style={{ color: CLR_MUTED }}>
                        <MapPin size={14} style={{ color: CLR_ACCENT, flexShrink: 0 }} />
                        <span className="truncate">{tech.location}</span>
                      </div>
                    )}
                    {tech.inspection_fee > 0 && (
                      <div className="flex items-center gap-2" style={{ color: CLR_MUTED }}>
                        <Wallet size={14} style={{ color: CLR_ACCENT, flexShrink: 0 }} />
                        <span className="truncate">
                          Rp {Number(tech.inspection_fee).toLocaleString("id-ID")} / inspeksi
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/technicians/${tech.id}`, { state: { product_id, product_slug } }); }}
                    className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition hover:brightness-110 active:scale-95"
                    style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}
                  >
                    Pesan Inspeksi
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}