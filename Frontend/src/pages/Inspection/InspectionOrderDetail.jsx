import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ClipboardCheck, User, Laptop, CreditCard,
  FileText, Star, CalendarDays, Clock, MapPin, AlertCircle,
  CheckCircle2, Circle, BadgeCheck, Sparkles, XCircle,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { payInspectionJob, cancelInspectionJob } from "../../services/inspectionService";
import InspectionRatingForm from "../../components/ui/InspectionRatingForm";
import api from "../../services/api";
import { toast } from "../../components/ui/Toast";

/* ─── Design Tokens ─── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";
const GRAD_PRIMARY  = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG  = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const GRAD_CARD_BG  = "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)";
const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";
const SECTION_X     = "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8";

/* ─── Helpers ─── */
function SectionLabel({ icon, text, color = "#2563EB", bg = "rgba(37,99,235,0.08)", border = "rgba(37,99,235,0.20)" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {icon} {text}
    </span>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}>
      <span className="mt-0.5 flex-shrink-0" style={{ color: CLR_ACCENT }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: CLR_SUBTLE }}>{label}</p>
        <p className="text-sm font-semibold break-words" style={{ color: CLR_TEXT }}>{value || "-"}</p>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatTime(timeStr) {
  if (!timeStr) return null;
  return timeStr.slice(0, 5); // HH:MM
}

function formatCurrency(amount) {
  if (amount == null) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

/* ─── Status Timeline ─── */
/**
 * Derives the current step index (0-based) from the job object.
 * Steps:
 *  0 → Pesanan Dibuat (always done once job exists)
 *  1 → Diterima Teknisi (status: accepted / in_progress / completed)
 *  2 → Teknisi Menjadwalkan Inspeksi (scheduled_by_technician = true)
 *  3 → Pembayaran (status: in_progress / completed)
 *  4 → Inspeksi Sedang Berlangsung (status: in_progress)
 *  5 → Inspeksi Selesai (status: completed)
 *  6 → Laporan Tersedia (status: completed + report exists)
 */
function deriveCurrentStep(job) {
  const s = job?.status;
  if (s === "completed" && job?.report) return 6;
  if (s === "completed") return 5;
  if (s === "in_progress") return 4;
  // in_progress before paid = step 3 (payment done)
  // We rely on payment_status or check if status just moved to in_progress
  if (s === "accepted" && job?.scheduled_by_technician) return 2;
  if (s === "accepted") return 1;
  // assigned
  return 0;
}

const TIMELINE_STEPS = [
  { label: "Pesanan Dibuat", desc: "Permintaan inspeksi berhasil dikirim." },
  { label: "Diterima Teknisi", desc: "Teknisi menerima permintaan inspeksi Anda." },
  { label: "Teknisi Menjadwalkan Inspeksi", desc: "Teknisi sudah menentukan jadwal inspeksi." },
  { label: "Pembayaran", desc: "Pembayaran biaya inspeksi berhasil." },
  { label: "Inspeksi Berlangsung", desc: "Teknisi sedang melakukan inspeksi laptop." },
  { label: "Inspeksi Selesai", desc: "Inspeksi laptop telah selesai dilakukan." },
  { label: "Laporan Tersedia", desc: "Laporan hasil inspeksi sudah dapat dilihat." },
];

function StatusTimeline({ job }) {
  const currentStep = deriveCurrentStep(job);

  return (
    <div className="space-y-1">
      {TIMELINE_STEPS.map((step, idx) => {
        const done    = idx < currentStep;
        const active  = idx === currentStep;
        const pending = idx > currentStep;

        return (
          <div key={idx} className="flex items-start gap-4">
            {/* Icon column */}
            <div className="flex flex-col items-center" style={{ minWidth: 28 }}>
              {done ? (
                <CheckCircle2 size={22} style={{ color: "#16A34A" }} />
              ) : active ? (
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: CLR_ACCENT, background: "#EFF6FF" }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CLR_ACCENT }} />
                </div>
              ) : (
                <Circle size={22} style={{ color: CLR_BORDER_LT }} />
              )}
              {/* Connector line (except last) */}
              {idx < TIMELINE_STEPS.length - 1 && (
                <div
                  className="w-0.5 flex-1 mt-1"
                  style={{
                    minHeight: 20,
                    background: done ? "#16A34A" : CLR_BORDER_LT,
                  }}
                />
              )}
            </div>

            {/* Text column */}
            <div className="pb-4 flex-1 min-w-0">
              <p
                className="text-sm font-semibold leading-snug"
                style={{
                  color: done ? "#16A34A" : active ? CLR_ACCENT : CLR_SUBTLE,
                  fontFamily: FONT_BODY,
                }}
              >
                {step.label}
              </p>
              {(done || active) && (
                <p className="text-xs mt-0.5" style={{ color: CLR_MUTED }}>{step.desc}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */
export default function InspectionOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying]   = useState(false);
  const [cancelling, setCancelling]           = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/v1/inspection-jobs/${id}`);
      setJob(res.data?.data ?? res.data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat detail pesanan inspeksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  /* ─── Midtrans Pay ─── */
  const handlePay = async () => {
    if (!window.snap) {
      toast.error("Payment gateway belum siap. Coba refresh halaman.");
      return;
    }
    setPaying(true);
    try {
      const res = await payInspectionJob(job.id);
      const snapToken = res?.data?.snap_token ?? res?.snap_token;
      if (!snapToken) throw new Error("Token pembayaran tidak ditemukan.");

      window.snap.pay(snapToken, {
        onSuccess: () => { toast.success("Pembayaran berhasil!"); fetchJob(); },
        onPending: () => { toast.info?.("Pembayaran sedang diproses."); fetchJob(); },
        onError:   () => toast.error("Pembayaran gagal."),
        onClose:   () => setPaying(false),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Gagal memproses pembayaran.");
      setPaying(false);
    }
  };

  /* ─── Cancel ─── */
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelInspectionJob(job.id);
      toast.success("Inspeksi berhasil dibatalkan.");
      setShowCancelConfirm(false);
      fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membatalkan inspeksi.");
    } finally {
      setCancelling(false);
    }
  };

  /* ─── Loading ─── */
  if (loading) return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: FONT_BODY }}>
      <Navbar />
      <div className={`${SECTION_X} py-10`}>
        <div className="animate-pulse space-y-4">
          <div className="h-36 rounded-3xl" style={{ background: "#E2E8F0" }} />
          <div className="h-64 rounded-3xl" style={{ background: "#E2E8F0" }} />
          <div className="h-48 rounded-3xl" style={{ background: "#E2E8F0" }} />
        </div>
      </div>
    </div>
  );

  if (!job) return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: FONT_BODY }}>
      <Navbar />
      <div className={`${SECTION_X} py-20 flex flex-col items-center text-center`}>
        <AlertCircle size={40} style={{ color: CLR_SUBTLE }} className="mb-3" />
        <p className="text-sm" style={{ color: CLR_MUTED }}>Detail pesanan tidak ditemukan.</p>
        <button
          onClick={() => navigate("/inspections")}
          className="mt-4 text-sm font-semibold"
          style={{ color: CLR_ACCENT }}
        >
          Kembali ke Riwayat Inspeksi
        </button>
      </div>
    </div>
  );

  const technician     = job.technician ?? job.technician_user ?? {};
  const product        = job.product ?? {};
  const report         = job.report ?? job.inspection_report ?? null;
  const isCompleted    = job.status === "completed";
  const isAccepted     = job.status === "accepted";
  const isInProgress   = job.status === "in_progress";
  const isAssigned     = job.status === "assigned";
  const canCancel      = isAssigned; // buyer hanya bisa batalkan saat belum diterima teknisi
  const needsPayment   = isAccepted && job.scheduled_by_technician && !job.payment_id && !job.paid_at;
  const hasSchedule    = !!job.technician_schedule_date;
  const hasReport      = isCompleted && !!report;
  const showRating     = isCompleted && !job.buyer_rating;
  const techName       = technician.name ?? technician.user?.name ?? "Teknisi";
  const productName    = job.product_name ?? product.model ?? product.name ?? product.title ?? `Job #${job.id}`;

  return (
    <div style={{ fontFamily: FONT_BODY, background: "#F0F9FF", minHeight: "100vh" }}>
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "#F0F9FF" }} />
      <Navbar />

      <main className={`${SECTION_X} py-8 space-y-6`}>

        {/* ── Back ── */}
        <button
          onClick={() => navigate("/inspections")}
          className="inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: CLR_ACCENT }}
        >
          <ChevronLeft size={16} /> Kembali ke Riwayat Inspeksi
        </button>

        {/* ── Hero Header ── */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: GRAD_HERO_BG, border: `1px solid ${CLR_BORDER}` }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 pointer-events-none"
            style={{ background: GRAD_PRIMARY, filter: "blur(40px)" }}
          />
          <div className="relative px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: GRAD_PRIMARY }}
            >
              <ClipboardCheck size={26} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <SectionLabel icon={<BadgeCheck size={11} />} text="Pesanan Inspeksi" />
              <h1
                className="text-xl sm:text-2xl mt-2 mb-0.5 font-extrabold truncate"
                style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}
              >
                {productName}
              </h1>
              <p className="text-sm" style={{ color: CLR_MUTED }}>
                Job #{job.id} · Teknisi: <span className="font-semibold" style={{ color: CLR_ACCENT }}>{techName}</span>
              </p>
            </div>
            {/* Status Badge + Batalkan */}
            <div className="flex flex-col items-end gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: isCompleted
                    ? "rgba(22,163,74,0.12)"
                    : isInProgress
                    ? "rgba(234,179,8,0.12)"
                    : isAccepted
                    ? "rgba(37,99,235,0.10)"
                    : job.status === "cancelled"
                    ? "rgba(239,68,68,0.10)"
                    : "rgba(148,163,184,0.15)",
                  color: isCompleted
                    ? "#16A34A"
                    : isInProgress
                    ? "#CA8A04"
                    : isAccepted
                    ? CLR_ACCENT
                    : job.status === "cancelled"
                    ? "#DC2626"
                    : CLR_SUBTLE,
                }}
              >
                {isCompleted ? "Selesai" : isInProgress ? "Berlangsung" : isAccepted ? "Diterima" : job.status === "cancelled" ? "Dibatalkan" : job.status}
              </span>
              {canCancel && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition hover:brightness-95"
                  style={{ background: "rgba(239,68,68,0.10)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.25)" }}
                >
                  <XCircle size={13} /> Batalkan Inspeksi
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* Left column: Timeline + Schedule */}
          <div className="lg:col-span-3 space-y-6">

            {/* Status Timeline Card */}
            <div
              className="rounded-3xl p-6"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}` }}
            >
              <SectionLabel icon={<Sparkles size={11} />} text="Status Pesanan" />
              <div className="mt-5">
                <StatusTimeline job={job} />
              </div>
            </div>

            {/* Jadwal Inspeksi */}
            <div
              className="rounded-3xl p-6"
              style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}` }}
            >
              <SectionLabel icon={<CalendarDays size={11} />} text="Jadwal Inspeksi" />
              {hasSchedule ? (
                <div className="mt-4 space-y-0">
                  <InfoRow
                    icon={<CalendarDays size={15} />}
                    label="Tanggal"
                    value={formatDate(job.technician_schedule_date)}
                  />
                  {job.technician_schedule_time && (
                    <InfoRow
                      icon={<Clock size={15} />}
                      label="Waktu"
                      value={formatTime(job.technician_schedule_time)}
                    />
                  )}
                  {job.technician_schedule_notes && (
                    <InfoRow
                      icon={<FileText size={15} />}
                      label="Catatan Teknisi"
                      value={job.technician_schedule_notes}
                    />
                  )}
                </div>
              ) : (
                <div
                  className="mt-4 flex items-start gap-3 rounded-2xl px-4 py-3"
                  style={{ background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.25)" }}
                >
                  <Clock size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#CA8A04" }} />
                  <p className="text-sm" style={{ color: "#92400E" }}>
                    Teknisi akan menjadwalkan inspeksi dalam <strong>1–3 hari ke depan</strong>.
                    Anda akan mendapat notifikasi saat jadwal sudah ditentukan.
                  </p>
                </div>
              )}
            </div>

            {/* Laporan Inspeksi */}
            {hasReport && (
              <div
                className="rounded-3xl p-6"
                style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}` }}
              >
                <SectionLabel
                  icon={<FileText size={11} />}
                  text="Laporan Tersedia"
                  color="#16A34A"
                  bg="rgba(22,163,74,0.08)"
                  border="rgba(22,163,74,0.20)"
                />
                <div className="mt-4 space-y-3">
                  {report.overall_score != null && (
                    <div
                      className="flex items-center gap-4 rounded-2xl px-5 py-4"
                      style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.18)" }}
                    >
                      <div className="text-center">
                        <p className="text-3xl font-extrabold" style={{ fontFamily: FONT_DISPLAY, color: "#16A34A" }}>
                          {report.overall_score}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest font-semibold mt-0.5" style={{ color: "#15803D" }}>
                          Skor
                        </p>
                      </div>
                      <div
                        className="w-px self-stretch"
                        style={{ background: "rgba(22,163,74,0.2)" }}
                      />
                      <div className="flex-1 min-w-0">
                        {report.recommendation && (
                          <>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#15803D" }}>
                              Rekomendasi
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: CLR_TEXT }}>
                              {report.recommendation}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/inspections/${job.id}`)}
                    className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition hover:brightness-105"
                    style={{ background: GRAD_PRIMARY }}
                  >
                    Lihat Detail Laporan
                  </button>
                </div>
              </div>
            )}

            {/* Rating Form */}
            {showRating && (
              <div
                className="rounded-3xl p-6"
                style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}` }}
              >
                <SectionLabel icon={<Star size={11} />} text="Beri Rating Teknisi" />
                <div className="mt-4">
                  <InspectionRatingForm jobId={job.id} onSuccess={fetchJob} />
                </div>
              </div>
            )}

            {/* Already rated — tampil lengkap dengan bintang dan review */}
            {isCompleted && job.buyer_rating && (
              <div
                className="rounded-3xl p-6 space-y-4"
                style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}` }}
              >
                <SectionLabel
                  icon={<Star size={11} />}
                  text="Rating Teknisi"
                  color="#16A34A"
                  bg="rgba(22,163,74,0.08)"
                  border="rgba(22,163,74,0.20)"
                />

                <div
                  className="rounded-2xl px-5 py-4 flex items-start gap-4"
                  style={{ background: "rgba(22,163,74,0.05)", border: "1px solid rgba(22,163,74,0.18)" }}
                >
                  {/* Bintang + skor */}
                  <div className="flex-shrink-0 text-center">
                    <p
                      className="text-3xl font-extrabold leading-none"
                      style={{ fontFamily: FONT_DISPLAY, color: "#16A34A" }}
                    >
                      {job.buyer_rating}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mt-1" style={{ color: "#15803D" }}>
                      / 5
                    </p>
                    {/* Bintang visual */}
                    <div className="flex gap-0.5 mt-2 justify-center">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={14}
                          style={
                            n <= job.buyer_rating
                              ? { fill: "#F59E0B", color: "#F59E0B" }
                              : { fill: "rgba(148,163,184,0.3)", color: "#CBD5E1" }
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="w-px self-stretch" style={{ background: "rgba(22,163,74,0.2)" }} />

                  {/* Detail */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 size={15} style={{ color: "#16A34A" }} />
                      <p className="text-sm font-semibold" style={{ color: "#15803D" }}>
                        Rating sudah dikirim
                      </p>
                    </div>
                    {job.rating?.review ? (
                      <p className="text-sm leading-relaxed mt-1" style={{ color: CLR_MUTED }}>
                        "{job.rating.review}"
                      </p>
                    ) : (
                      <p className="text-xs mt-1" style={{ color: CLR_SUBTLE }}>
                        Tidak ada ulasan tertulis.
                      </p>
                    )}
                    {job.rating?.created_at && (
                      <p className="text-[11px] mt-2" style={{ color: CLR_SUBTLE }}>
                        Dikirim pada{" "}
                        {new Date(job.rating.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column: Info cards + Payment */}
          <div className="lg:col-span-2 space-y-5">

            {/* Info Teknisi */}
            <div
              className="rounded-3xl p-5"
              style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}` }}
            >
              <SectionLabel icon={<User size={11} />} text="Info Teknisi" />
              <div className="mt-3 space-y-0">
                <InfoRow icon={<User size={15} />} label="Nama" value={techName} />
                {(technician.rating_avg ?? technician.rating) && (
                  <InfoRow
                    icon={<Star size={15} />}
                    label="Rating"
                    value={`${Number(technician.rating_avg ?? technician.rating).toFixed(1)} / 5.0`}
                  />
                )}
              </div>
            </div>

            {/* Info Laptop */}
            <div
              className="rounded-3xl p-5"
              style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}` }}
            >
              <SectionLabel icon={<Laptop size={11} />} text="Info Laptop" />
              <div className="mt-3 space-y-0">
                {product.brand && (
                  <InfoRow icon={<Laptop size={15} />} label="Merek" value={product.brand} />
                )}
                {(product.model ?? product.name) && (
                  <InfoRow icon={<Laptop size={15} />} label="Model" value={product.model ?? product.name} />
                )}
                <InfoRow
                  icon={<MapPin size={15} />}
                  label="Lokasi Laptop"
                  value={job.laptop_address ?? product.location ?? "-"}
                />
              </div>
            </div>

            {/* Pembayaran */}
            <div
              className="rounded-3xl p-5"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}` }}
            >
              <SectionLabel icon={<CreditCard size={11} />} text="Pembayaran" />
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: CLR_MUTED }}>Biaya Inspeksi</span>
                  <span className="text-base font-extrabold" style={{ fontFamily: FONT_DISPLAY, color: CLR_ACCENT }}>
                    {formatCurrency(job.fee)}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}
                >
                  <span className="text-sm font-semibold" style={{ color: CLR_TEXT }}>Status</span>
                  {job.paid_at || job.payment_id || isInProgress || isCompleted ? (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: "rgba(22,163,74,0.12)", color: "#16A34A" }}
                    >
                      <CheckCircle2 size={12} /> Lunas
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: "rgba(234,179,8,0.12)", color: "#CA8A04" }}
                    >
                      Belum Dibayar
                    </span>
                  )}
                </div>

                {needsPayment && (
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-60 transition hover:brightness-105 mt-1"
                    style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}
                  >
                    {paying ? "Memproses..." : `Bayar ${formatCurrency(job.fee)}`}
                  </button>
                )}

                {/* Belum jadwal = belum bisa bayar, kasih info */}
                {isAccepted && !job.scheduled_by_technician && (
                  <p className="text-xs text-center mt-1" style={{ color: CLR_SUBTLE }}>
                    Pembayaran tersedia setelah teknisi menjadwalkan inspeksi.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ─── Modal Konfirmasi Batalkan ─── */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ background: CLR_CARD, border: `1px solid ${CLR_BORDER}` }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.10)" }}
              >
                <XCircle size={28} color="#DC2626" />
              </div>
            </div>

            {/* Title & Body */}
            <h3
              className="text-center text-base font-bold mb-2"
              style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}
            >
              Batalkan Inspeksi?
            </h3>
            <p className="text-center text-sm mb-6" style={{ color: CLR_SUBTLE }}>
              Apakah kamu yakin ingin membatalkan permintaan inspeksi ini?
              Tindakan ini tidak dapat diurungkan.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-95"
                style={{
                  background: "rgba(148,163,184,0.12)",
                  color: CLR_SUBTLE,
                  border: `1px solid ${CLR_BORDER}`,
                }}
              >
                Tidak, Kembali
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
              >
                {cancelling ? "Membatalkan..." : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
