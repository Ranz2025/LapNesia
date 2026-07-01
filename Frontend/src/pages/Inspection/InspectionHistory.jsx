import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw,
  Wrench, ClipboardList, Plus, ChevronRight, Sparkles, Zap, CalendarDays,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import api from "../../services/api";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";
const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const CLR_TEXT     = "#0F172A";
const CLR_MUTED    = "#475569";
const CLR_SUBTLE   = "#94A3B8";
const CLR_BORDER   = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT   = "#2563EB";
const SECTION_X    = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

const STATUS_BADGE = {
  pending:     { bg: "rgba(245,158,11,0.12)",  color: "#D97706", label: "Menunggu",         icon: AlertCircle },
  assigned:    { bg: "rgba(245,158,11,0.12)",  color: "#D97706", label: "Menunggu Teknisi", icon: AlertCircle },
  accepted:    { bg: "rgba(37,99,235,0.12)",   color: "#2563EB", label: "Diterima",          icon: Clock },
  in_progress: { bg: "rgba(8,145,178,0.12)",   color: "#0891B2", label: "Sedang Berlangsung", icon: Clock },
  rejected:    { bg: "rgba(239,68,68,0.12)",   color: "#DC2626", label: "Ditolak",           icon: XCircle },
  completed:   { bg: "rgba(16,185,129,0.12)",  color: "#059669", label: "Selesai",           icon: CheckCircle },
  cancelled:   { bg: "rgba(239,68,68,0.12)",   color: "#DC2626", label: "Dibatalkan",        icon: XCircle },
};

function SectionLabel({ icon, text }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-3"
      style={{ color: CLR_ACCENT, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)" }}
    >
      {icon} {text}
    </span>
  );
}

function InspectionCard({ inspection, onClick }) {
  const badge = STATUS_BADGE[inspection.status] || STATUS_BADGE.pending;
  const Icon  = badge.icon;

  const hasSchedule = !!inspection.technician_schedule_date;
  const scheduleLabel = hasSchedule
    ? new Date(inspection.technician_schedule_date).toLocaleDateString("id-ID", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      })
    : "Teknisi sedang atur jadwal";
  const timeLabel = hasSchedule && inspection.technician_schedule_time
    ? `Pukul ${inspection.technician_schedule_time.slice(0, 5)}`
    : "1–3 hari ke depan";

  return (
    <div
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = CLR_ACCENT; e.currentTarget.style.boxShadow = "0 16px 40px -10px rgba(37,99,235,0.18)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
    >
      <div className="h-1" style={{ background: badge.color }} />
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: GRAD_PRIMARY, boxShadow: "0 6px 16px rgba(37,99,235,0.25)" }}
            >
              <Wrench size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base leading-snug" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>
                {inspection.laptop_brand} {inspection.laptop_model}
              </h3>
              <p className="text-[12px] mt-0.5" style={{ color: CLR_MUTED }}>
                Teknisi: {inspection.technician?.name || "Belum ditugaskan"}
              </p>
            </div>
          </div>
          <span
            className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0"
            style={{ background: badge.bg, color: badge.color }}
          >
            <Icon size={12} /> {badge.label}
          </span>
        </div>

        {/* Jadwal */}
        <div
          className="grid grid-cols-2 gap-3 text-[13px] mb-3 p-3 rounded-xl"
          style={{ background: "#F8FAFC", border: `1px solid ${CLR_BORDER_LT}` }}
        >
          <div className="flex items-center gap-2" style={{ color: hasSchedule ? CLR_TEXT : CLR_SUBTLE }}>
            <CalendarDays size={14} style={{ color: hasSchedule ? CLR_ACCENT : CLR_SUBTLE }} />
            <span className={!hasSchedule ? "italic" : ""}>{scheduleLabel}</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: hasSchedule ? CLR_TEXT : CLR_SUBTLE }}>
            <Clock size={14} style={{ color: hasSchedule ? CLR_ACCENT : CLR_SUBTLE }} />
            <span className={!hasSchedule ? "italic" : ""}>{timeLabel}</span>
          </div>
        </div>

        {/* Catatan buyer */}
        {inspection.inspection_notes && (
          <p className="text-[12px] leading-relaxed line-clamp-1 mb-3 italic" style={{ color: CLR_MUTED }}>
            {inspection.inspection_notes}
          </p>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}
        >
          <span className="text-[12px]" style={{ color: CLR_SUBTLE }}>
            Job #{inspection.id}
          </span>
          <span className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: CLR_ACCENT }}>
            Lihat Detail <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function InspectionHistory() {
  const [inspections, setInspections] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const navigate = useNavigate();

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/v1/inspection-jobs");
      const payload = res.data?.data;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setInspections(list);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat riwayat inspeksi.");
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInspections(); }, []);

  return (
    <div style={{ fontFamily: FONT_BODY, background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <main className={`${SECTION_X} pt-8 pb-14`}>

        {/* Hero */}
        <div
          className="rounded-3xl overflow-hidden relative mb-6"
          style={{ background: GRAD_HERO_BG, border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-10 py-8 sm:py-10">
            <div>
              <SectionLabel icon={<Zap size={11} />} text="Riwayat Pesanan" />
              <h1
                className="text-2xl sm:text-3xl leading-tight"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}
              >
                Riwayat{" "}
                <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  Inspeksi
                </span>
              </h1>
              <p className="text-sm mt-2 max-w-md" style={{ color: CLR_MUTED }}>
                Pantau seluruh pesanan inspeksi laptop kamu.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={fetchInspections}
                disabled={loading}
                className="flex items-center gap-2 text-sm font-semibold rounded-2xl px-4 py-2.5 transition hover:brightness-110 disabled:opacity-60"
                style={{ background: "#FFFFFF", border: `1.5px solid ${CLR_BORDER}`, color: CLR_ACCENT, fontFamily: FONT_DISPLAY }}
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => navigate("/technicians")}
                className="flex items-center gap-2 text-sm font-semibold rounded-2xl px-5 py-2.5 transition hover:brightness-110 active:scale-95 text-white"
                style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 16px rgba(37,99,235,0.28)" }}
              >
                <Plus size={16} /> Buat Inspeksi Baru
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-2xl p-4 mb-6 flex items-center justify-between gap-3"
            style={{ background: "#FFFFFF", border: "1px solid #FECACA" }}
          >
            <span className="flex items-center gap-2.5 text-sm" style={{ color: "#DC2626" }}>
              <AlertCircle size={16} /> {error}
            </span>
            <button
              onClick={fetchInspections}
              className="flex items-center gap-1.5 text-sm font-semibold flex-shrink-0 px-4 py-1.5 rounded-xl"
              style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}
            >
              <RefreshCw size={14} /> Coba Lagi
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : inspections.length === 0 ? (
          <div
            className="rounded-2xl p-14 text-center flex flex-col items-center"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}` }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: GRAD_PRIMARY, boxShadow: "0 8px 24px rgba(37,99,235,0.25)" }}
            >
              <ClipboardList size={28} className="text-white" />
            </div>
            <h3 className="text-xl mb-2" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
              Belum ada inspeksi
            </h3>
            <p className="text-sm max-w-xs mb-6" style={{ color: CLR_MUTED }}>
              Pesan inspeksi teknisi untuk mengecek kondisi laptop sebelum beli.
            </p>
            <button
              onClick={() => navigate("/technicians")}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: GRAD_PRIMARY, boxShadow: "0 4px 16px rgba(37,99,235,0.28)" }}
            >
              Buat Inspeksi
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} style={{ color: CLR_ACCENT }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>
                Semua Pesanan ({inspections.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {inspections.map((inspection) => (
                <InspectionCard
                  key={inspection.id}
                  inspection={inspection}
                  onClick={() => navigate(`/inspection-orders/${inspection.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
