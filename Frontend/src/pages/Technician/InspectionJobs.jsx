import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, Briefcase, RefreshCw, MapPin,
  User, FileText, CheckCircle2, Sparkles, Zap, ArrowRight,
  XCircle, CalendarDays, X, AlertCircle, MessageCircle,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import api from "../../services/api";
import { rejectInspectionJob, setInspectionSchedule, cancelInspectionJob } from "../../services/inspectionService";
import { startChat } from "../../services/chatService";

/* ─── DESIGN TOKENS (mirrors Home.jsx) ─────────────────────── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";
const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

/* Shared vertical rhythm — same tokens as Home.jsx so both pages breathe alike */
const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
const SECTION_Y = "py-10 md:py-14";

const STATUS_BADGE = {
  pending:     { bg: "rgba(245,158,11,0.12)", color: "#D97706", label: "Menunggu" },
  assigned:    { bg: "rgba(245,158,11,0.12)", color: "#D97706", label: "Menunggu Konfirmasi" },
  accepted:    { bg: "rgba(37,99,235,0.12)",  color: "#2563EB", label: "Diterima" },
  rejected:    { bg: "rgba(239,68,68,0.12)",  color: "#DC2626", label: "Ditolak" },
  in_progress: { bg: "rgba(8,145,178,0.12)",  color: "#0891B2", label: "Berlangsung" },
  completed:   { bg: "rgba(16,185,129,0.12)", color: "#059669", label: "Selesai" },
  cancelled:   { bg: "rgba(239,68,68,0.12)",  color: "#DC2626", label: "Dibatalkan" },
};

/* ─── SECTION LABEL (now accepts color/bg/border like Home.jsx) ─── */
function SectionLabel({ icon, text, color = CLR_ACCENT, bg = "rgba(37,99,235,0.08)", border = "rgba(37,99,235,0.20)" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-3"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {icon} {text}
    </span>
  );
}

/* ─── Modal Input Jadwal ─── */
function ScheduleModal({ jobId, onClose, onSuccess }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ date: "", time: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time) return toast.error("Tanggal dan waktu wajib diisi.");
    setSaving(true);
    try {
      await setInspectionSchedule(jobId, {
        technician_schedule_date:  form.date,
        technician_schedule_time:  form.time,
        technician_schedule_notes: form.notes || null,
      });
      toast.success("Jadwal berhasil disimpan! Buyer & Seller telah dinotifikasi.");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan jadwal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}`, boxShadow: "0 24px 64px rgba(37,99,235,0.18)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${CLR_BORDER_LT}`, background: GRAD_HERO_BG }}>
          <div>
            <SectionLabel icon={<CalendarDays size={11} />} text="Input Jadwal" />
            <h3 className="text-lg font-bold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
              Tentukan Jadwal Inspeksi
            </h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:bg-white/60 flex-shrink-0" style={{ color: CLR_MUTED }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs leading-relaxed rounded-2xl px-3 py-2.5" style={{ background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.25)", color: "#78350F" }}>
            <AlertCircle size={12} className="inline mr-1 mb-0.5" style={{ color: "#CA8A04" }} />
            Hubungi seller terlebih dahulu untuk menyepakati waktu inspeksi, lalu input di sini.
          </p>

          {/* Tanggal */}
          <div>
            <label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: CLR_TEXT }}>
              <Calendar size={14} style={{ color: CLR_ACCENT }} /> Tanggal Inspeksi
            </label>
            <input
              type="date"
              min={today}
              required
              value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full outline-none rounded-2xl px-4 py-2.5 text-sm transition"
              style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
              onFocus={(e) => (e.currentTarget.style.borderColor = CLR_ACCENT)}
              onBlur={(e)  => (e.currentTarget.style.borderColor = CLR_BORDER_LT)}
            />
          </div>

          {/* Waktu */}
          <div>
            <label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: CLR_TEXT }}>
              <Clock size={14} style={{ color: CLR_ACCENT }} /> Waktu Inspeksi
            </label>
            <input
              type="time"
              required
              value={form.time}
              onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))}
              className="w-full outline-none rounded-2xl px-4 py-2.5 text-sm transition"
              style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
              onFocus={(e) => (e.currentTarget.style.borderColor = CLR_ACCENT)}
              onBlur={(e)  => (e.currentTarget.style.borderColor = CLR_BORDER_LT)}
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: CLR_TEXT }}>
              <FileText size={14} style={{ color: CLR_ACCENT }} /> Catatan
              <span className="font-normal text-xs" style={{ color: CLR_SUBTLE }}>(opsional)</span>
            </label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="Contoh: Teknisi akan datang ke alamat seller pukul 09.00"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full outline-none rounded-2xl px-4 py-2.5 text-sm resize-none transition placeholder:text-[#94A3B8]"
              style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
              onFocus={(e) => (e.currentTarget.style.borderColor = CLR_ACCENT)}
              onBlur={(e)  => (e.currentTarget.style.borderColor = CLR_BORDER_LT)}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold transition"
              style={{ background: "#F1F5F9", color: CLR_MUTED, border: `1px solid ${CLR_BORDER_LT}` }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}
            >
              {saving ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Job Card ─── */
function JobCard({ job, onAccept, onReject, onComplete, onOpenSchedule, onCancel, onChatSeller, onChatBuyer, navigate }) {
  const badge = STATUS_BADGE[job.status] || STATUS_BADGE.pending;
  const isPending  = job.status === "pending" || job.status === "assigned";
  const isAccepted = job.status === "accepted";
  const isActive   = job.status === "in_progress";
  const isDone     = job.status === "completed";
  const hasSchedule = !!job.scheduled_by_technician && !!job.technician_schedule_date;
  const canSchedule = (isAccepted || isActive) && !hasSchedule;
  const canUpload   = isDone && !job.report;
  const hasReport   = isDone && !!job.report;
  const canCancel   = isPending || isAccepted; // teknisi bisa batalkan sebelum dibayar
  const seller      = job.product?.seller;
  const buyer       = job.buyer ?? job.requester;
  const canChatSeller = !!seller && !["cancelled", "rejected"].includes(job.status);
  const canChatBuyer  = !!buyer  && !["cancelled", "rejected"].includes(job.status);

  /* Label badge lebih informatif */
  const badgeLabel = isAccepted && !hasSchedule
    ? "Diterima — Belum Dijadwalkan"
    : isAccepted && hasSchedule
    ? "Jadwal Sudah Diinput"
    : badge.label;

  const badgeBg    = isAccepted && !hasSchedule ? "rgba(234,179,8,0.12)"  : badge.bg;
  const badgeColor = isAccepted && !hasSchedule ? "#CA8A04"               : badge.color;

  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full"
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = CLR_ACCENT; e.currentTarget.style.boxShadow = "0 16px 40px -10px rgba(37,99,235,0.20)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
    >
      {/* Top accent strip */}
      <div className="h-1 flex-shrink-0" style={{ background: isDone ? GRAD_PRIMARY : badgeColor }} />

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
          <div className="min-w-0 flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: GRAD_PRIMARY, boxShadow: "0 6px 16px rgba(37,99,235,0.25)" }}
            >
              <Briefcase size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base leading-snug" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>
                {job.laptop_brand} {job.laptop_model}
              </h3>
              <p className="text-[12px] mt-0.5 flex items-center gap-1.5" style={{ color: CLR_MUTED }}>
                <User size={12} /> {job.buyer?.name || job.requester?.name || "N/A"}
              </p>
            </div>
          </div>
          <span
            className="px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0"
            style={{ background: badgeBg, color: badgeColor }}
          >
            {badgeLabel}
          </span>
        </div>

        {/* Info grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] mb-4 p-3 rounded-xl"
          style={{ background: "#F8FAFC", border: `1px solid ${CLR_BORDER_LT}` }}
        >
          <div className="flex items-center gap-2" style={{ color: CLR_MUTED }}>
            <User size={14} style={{ color: CLR_ACCENT }} />
            <span>Buyer: <span className="font-medium" style={{ color: CLR_TEXT }}>{job.buyer?.name || job.requester?.name || "-"}</span></span>
          </div>
          {seller && (
            <div className="flex items-center gap-2" style={{ color: CLR_MUTED }}>
              <User size={14} style={{ color: "#0891B2" }} />
              <span>Seller: <span className="font-medium" style={{ color: CLR_TEXT }}>{seller.name}</span></span>
            </div>
          )}
          {job.laptop_address && (
            <div className="flex items-center gap-2 sm:col-span-2" style={{ color: CLR_MUTED }}>
              <MapPin size={14} style={{ color: CLR_ACCENT }} />
              <span>Alamat Laptop: <span className="font-medium" style={{ color: CLR_TEXT }}>{job.laptop_address}</span></span>
            </div>
          )}
        </div>

        {/* Jadwal yang sudah diinput teknisi */}
        {hasSchedule && (
          <div
            className="flex flex-col gap-1.5 mb-4 p-3 rounded-xl"
            style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.18)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: CLR_ACCENT }}>
              Jadwal Inspeksi
            </p>
            <div className="flex items-center gap-2 text-[13px]" style={{ color: CLR_TEXT }}>
              <CalendarDays size={13} style={{ color: CLR_ACCENT }} />
              <span>
                {new Date(job.technician_schedule_date).toLocaleDateString("id-ID", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
            {job.technician_schedule_time && (
              <div className="flex items-center gap-2 text-[13px]" style={{ color: CLR_TEXT }}>
                <Clock size={13} style={{ color: CLR_ACCENT }} />
                <span>Pukul {job.technician_schedule_time.slice(0, 5)} WIB</span>
              </div>
            )}
            {job.technician_schedule_notes && (
              <p className="text-[12px] mt-1" style={{ color: CLR_MUTED }}>{job.technician_schedule_notes}</p>
            )}
          </div>
        )}

        {/* Notes dari buyer */}
        {job.inspection_notes && (
          <p className="text-[12px] leading-relaxed mb-3 italic" style={{ color: CLR_MUTED }}>
            Catatan buyer: {job.inspection_notes}
          </p>
        )}

        {/* Spacer keeps the action row pinned to the bottom of every card, even with uneven content heights */}
        <div className="mt-auto" />

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
          {/* Pending: terima / tolak */}
          {isPending && (
            <>
              <button
                onClick={() => onAccept(job.id)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-2xl text-[#0F172A] transition hover:brightness-110 active:scale-95"
                style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 16px rgba(37,99,235,0.28)" }}
              >
                Terima Job <ArrowRight size={14} />
              </button>
              <button
                onClick={() => onReject(job.id)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-2xl transition hover:brightness-110 active:scale-95"
                style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.30)", color: "#DC2626", fontFamily: FONT_DISPLAY }}
              >
                Tolak <XCircle size={14} />
              </button>
            </>
          )}

          {/* Accepted: input jadwal (jika belum) */}
          {canSchedule && (
            <button
              onClick={() => onOpenSchedule(job.id)}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-2xl transition hover:brightness-110 active:scale-95"
              style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.35)", color: "#B45309", fontFamily: FONT_DISPLAY }}
            >
              <CalendarDays size={15} /> Input Jadwal
            </button>
          )}

          {/* Accepted & sudah jadwal: bisa update jadwal */}
          {isAccepted && hasSchedule && (
            <button
              onClick={() => onOpenSchedule(job.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-2xl transition hover:brightness-110"
              style={{ background: "rgba(37,99,235,0.08)", border: `1px solid ${CLR_BORDER}`, color: CLR_ACCENT }}
            >
              <CalendarDays size={13} /> Ubah Jadwal
            </button>
          )}

          {/* In progress: selesaikan */}
          {isActive && (
            <>
              <button
                onClick={() => onComplete(job.id)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-2xl transition hover:brightness-110 active:scale-95"
                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)", color: "#059669", fontFamily: FONT_DISPLAY }}
              >
                <CheckCircle2 size={15} /> Selesaikan Inspeksi
              </button>
              {/* Bisa update jadwal jika sudah set */}
              {hasSchedule && (
                <button
                  onClick={() => onOpenSchedule(job.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-2xl transition hover:brightness-110"
                  style={{ background: "rgba(37,99,235,0.08)", border: `1px solid ${CLR_BORDER}`, color: CLR_ACCENT }}
                >
                  <CalendarDays size={13} /> Ubah Jadwal
                </button>
              )}
            </>
          )}

          {/* Completed: upload laporan */}
          {canUpload && (
            <button
              onClick={() => navigate(`/technician/jobs/${job.id}/report`)}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-2xl transition hover:brightness-110 active:scale-95"
              style={{ background: "rgba(37,99,235,0.10)", border: `1px solid ${CLR_BORDER}`, color: CLR_ACCENT, fontFamily: FONT_DISPLAY }}
            >
              <FileText size={15} /> Upload Laporan
            </button>
          )}

          {/* Completed + laporan sudah ada */}
          {hasReport && (
            <span
              className="flex items-center gap-1.5 px-4 py-2 text-[12px] rounded-2xl font-semibold"
              style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}
            >
              <CheckCircle2 size={14} /> Laporan Terkirim
            </span>
          )}

          {/* Chat Seller */}
          {canChatSeller && (
            <button
              onClick={() => onChatSeller(seller.id, job.product?.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-2xl transition hover:brightness-95 active:scale-95"
              style={{
                background: "rgba(8,145,178,0.10)",
                border: "1px solid rgba(8,145,178,0.25)",
                color: "#0891B2",
              }}
            >
              <MessageCircle size={13} /> Chat Seller
            </button>
          )}

          {/* Chat Buyer */}
          {canChatBuyer && (
            <button
              onClick={() => onChatBuyer(buyer.id, job.product?.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-2xl transition hover:brightness-95 active:scale-95"
              style={{
                background: "rgba(124,58,237,0.10)",
                border: "1px solid rgba(124,58,237,0.25)",
                color: "#7C3AED",
              }}
            >
              <MessageCircle size={13} /> Chat Buyer
            </button>
          )}

          {/* Batalkan — teknisi bisa batalkan saat assigned/accepted (sebelum dibayar) */}
          {canCancel && (
            <button
              onClick={() => onCancel(job.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-2xl transition hover:brightness-95 active:scale-95 ml-auto"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#DC2626",
              }}
            >
              <XCircle size={13} /> Batalkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function InspectionJobs() {
  const navigate = useNavigate();
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModal, setScheduleModal] = useState({ open: false, jobId: null });
  const [cancelModal,   setCancelModal]   = useState({ open: false, jobId: null });
  const [cancelling,    setCancelling]    = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.get("/v1/technician/jobs");
      const payload = result.data?.data;
      setJobs(Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (jobId) => {
    try {
      await api.put(`/v1/inspection-jobs/${jobId}/accept`);
      toast.success("Job berhasil diterima! Segera input jadwal inspeksi.");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menerima job.");
    }
  };

  const handleReject = async (jobId) => {
    try {
      await rejectInspectionJob(jobId);
      toast.success("Job berhasil ditolak.");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menolak job.");
    }
  };

  const handleComplete = async (jobId) => {
    try {
      await api.put(`/v1/inspection-jobs/${jobId}/complete`);
      toast.success("Inspeksi selesai! Silakan upload laporan.");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyelesaikan job.");
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelInspectionJob(cancelModal.jobId);
      toast.success("Inspeksi berhasil dibatalkan.");
      setCancelModal({ open: false, jobId: null });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membatalkan inspeksi.");
    } finally {
      setCancelling(false);
    }
  };

  const handleChatSeller = async (sellerId, productId) => {
    try {
      const res = await startChat(sellerId, productId ?? null);
      const roomId = res.data?.data?.id ?? res.data?.id;
      if (!roomId) throw new Error("Room tidak ditemukan.");
      navigate(`/chat/${roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuka chat.");
    }
  };

  const handleChatBuyer = async (buyerId, productId) => {
    try {
      const res = await startChat(buyerId, productId ?? null);
      const roomId = res.data?.data?.id ?? res.data?.id;
      if (!roomId) throw new Error("Room tidak ditemukan.");
      navigate(`/chat/${roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuka chat dengan buyer.");
    }
  };

  const pendingCount    = jobs.filter(j => j.status === "pending" || j.status === "assigned").length;
  const activeCount     = jobs.filter(j => j.status === "accepted" || j.status === "in_progress").length;
  const doneCount       = jobs.filter(j => j.status === "completed").length;
  const noScheduleCount = jobs.filter(j => j.status === "accepted" && !j.scheduled_by_technician).length;

  return (
    <div style={{ fontFamily: FONT_BODY, background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />

      {/* Schedule Modal */}
      {scheduleModal.open && (
        <ScheduleModal
          jobId={scheduleModal.jobId}
          onClose={() => setScheduleModal({ open: false, jobId: null })}
          onSuccess={fetchData}
        />
      )}

      {/* Cancel Confirm Modal */}
      {cancelModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setCancelModal({ open: false, jobId: null }); }}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
          >
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.10)" }}
                >
                  <XCircle size={26} color="#DC2626" />
                </div>
              </div>
              <h3
                className="text-center text-base font-bold mb-2"
                style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}
              >
                Batalkan Inspeksi?
              </h3>
              <p className="text-center text-sm mb-6" style={{ color: CLR_MUTED }}>
                Kamu yakin ingin membatalkan job ini? Buyer akan mendapat notifikasi pembatalan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelModal({ open: false, jobId: null })}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition hover:brightness-95 disabled:opacity-60"
                  style={{
                    background: "#F1F5F9",
                    color: CLR_MUTED,
                    border: `1px solid ${CLR_BORDER_LT}`,
                  }}
                >
                  Tidak, Kembali
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)", fontFamily: FONT_DISPLAY }}
                >
                  {cancelling ? "Membatalkan..." : "Ya, Batalkan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ AMBIENT GLOW BACKDROP (matches Home.jsx) ══════════════ */}
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

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 px-6 sm:px-10 md:px-14 py-10 md:py-12">
            <div className="min-w-0">
              <SectionLabel icon={<Zap size={11} />} text="Panel Teknisi" />
              <h1 className="text-3xl sm:text-4xl leading-[1.1]" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}>
                Pekerjaan{" "}
                <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  Inspeksi
                </span>
              </h1>
              <p className="text-[15px] mt-3 max-w-md leading-relaxed" style={{ color: CLR_MUTED }}>
                Kelola penugasan inspeksi dan jadwal kamu di sini.
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center justify-center gap-2 text-sm font-semibold rounded-2xl px-6 py-3.5 transition hover:brightness-110 active:scale-95 flex-shrink-0 disabled:opacity-60"
              style={{ background: "#FFFFFF", border: `1.5px solid ${CLR_BORDER}`, color: CLR_ACCENT, fontFamily: FONT_DISPLAY, boxShadow: "0 2px 12px rgba(37,99,235,0.08)" }}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════ STATUS OVERVIEW ═════════════════ */}
      <section className={`${SECTION_X} py-6`}>

        {/* Peringatan belum jadwal */}
        {!loading && noScheduleCount > 0 && (
          <div
            className="flex items-start gap-3 rounded-2xl px-5 py-4 mb-4"
            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.30)" }}
          >
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#CA8A04" }} />
            <p className="text-sm leading-relaxed" style={{ color: "#78350F" }}>
              <strong>Kamu punya {noScheduleCount} job yang belum dijadwalkan.</strong> Hubungi seller dan input jadwal inspeksi secepatnya.
            </p>
          </div>
        )}

        {/* Stats row — same card/hover pattern as Home.jsx's STATS ROW */}
        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Menunggu",    value: pendingCount,  icon: <AlertCircle size={18} />,   color: "#D97706" },
              { label: "Berlangsung", value: activeCount,   icon: <Clock size={18} />,          color: "#0891B2" },
              { label: "Selesai",     value: doneCount,     icon: <CheckCircle2 size={18} />,   color: "#059669" },
            ].map(({ label, value, icon, color }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center gap-2 px-6 py-7 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 4px 24px rgba(37,99,235,0.06)" }}
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-1"
                  style={{ background: color, boxShadow: `0 4px 14px ${color}40` }}
                >
                  {icon}
                </span>
                <p className="text-2xl font-bold leading-none" style={{ fontFamily: FONT_DISPLAY, color }}>
                  {value}
                </p>
                <p className="text-xs text-center" style={{ color: CLR_MUTED }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════ DAFTAR PEKERJAAN ═════════════════ */}
      <section className={`${SECTION_X} ${SECTION_Y} pt-2`}>

        {!loading && jobs.length > 0 && (
          <div className="flex items-end justify-between mb-7 pb-5 gap-4" style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}>
            <div>
              <SectionLabel icon={<Sparkles size={11} />} text="Daftar Tugas" />
              <h2 className="text-2xl" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
                Pekerjaan Inspeksi ({jobs.length})
              </h2>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl"
            style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)", border: `1px solid ${CLR_BORDER}` }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: GRAD_PRIMARY, boxShadow: "0 8px 24px rgba(37,99,235,0.25)" }}
            >
              <Briefcase size={28} className="text-white" />
            </div>
            <h3 className="text-xl mb-2" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
              Belum ada job inspeksi
            </h3>
            <p className="text-sm max-w-xs text-center" style={{ color: CLR_MUTED }}>
              Job baru akan muncul di sini setelah buyer memesan inspeksi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onAccept={handleAccept}
                onReject={handleReject}
                onComplete={handleComplete}
                onCancel={(jobId) => setCancelModal({ open: true, jobId })}
                onChatSeller={handleChatSeller}
                onChatBuyer={handleChatBuyer}
                onOpenSchedule={(jobId) => setScheduleModal({ open: true, jobId })}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}