import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, Clock, User, FileText, AlertCircle, CheckCircle, XCircle, Download,
  ChevronLeft, Gauge, ClipboardList, Wallet, ShieldCheck, Sparkles, Star,
  Camera, ZoomIn, X as XIcon,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { payInspectionJob } from "../../services/inspectionService";
import InspectionRatingForm from "../../components/ui/InspectionRatingForm";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const GRAD_CARD_BG = "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)";
const CLR_TEXT = "#0F172A";
const CLR_MUTED = "#475569";
const CLR_SUBTLE = "#94A3B8";
const CLR_BORDER = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT = "#2563EB";
const SECTION_X = "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8";

const COMPONENT_LABELS = {
  battery_status:  { label: "Baterai",  notesKey: "battery_notes" },
  screen_status:   { label: "Layar",    notesKey: "screen_notes" },
  keyboard_status: { label: "Keyboard", notesKey: "keyboard_notes" },
  touchpad_status: { label: "Touchpad", notesKey: "touchpad_notes" },
  port_status:     { label: "Port",     notesKey: "port_notes" },
  storage_status:  { label: "Storage",  notesKey: "storage_notes" },
  ram_status:      { label: "RAM",      notesKey: "ram_notes" },
  cpu_status:      { label: "CPU",      notesKey: "cpu_notes" },
  physical_status: { label: "Fisik",    notesKey: "physical_notes" },
};

const STATUS_STYLE = {
  good: { label: "Baik", bg: "rgba(34,197,94,0.10)", text: "#15803D", border: "rgba(34,197,94,0.25)" },
  needs_attention: { label: "Perlu Perhatian", bg: "rgba(245,158,11,0.10)", text: "#B45309", border: "rgba(245,158,11,0.25)" },
  faulty: { label: "Rusak", bg: "rgba(239,68,68,0.10)", text: "#B91C1C", border: "rgba(239,68,68,0.25)" },
};

const RECOMMEND_STYLE = {
  recommended: { label: "Direkomendasikan", bg: "rgba(34,197,94,0.10)", text: "#15803D", border: "rgba(34,197,94,0.25)" },
  fix_required: { label: "Perlu Perbaikan", bg: "rgba(245,158,11,0.10)", text: "#B45309", border: "rgba(245,158,11,0.25)" },
  not_recommended: { label: "Tidak Direkomendasikan", bg: "rgba(239,68,68,0.10)", text: "#B91C1C", border: "rgba(239,68,68,0.25)" },
};

const JOB_STATUS_MAP = {
  pending: { label: "Menunggu", bg: "rgba(245,158,11,0.10)", text: "#B45309", border: "rgba(245,158,11,0.25)", icon: AlertCircle },
  assigned: { label: "Ditugaskan", bg: "rgba(37,99,235,0.10)", text: "#1D4ED8", border: "rgba(37,99,235,0.25)", icon: Clock },
  accepted: { label: "Diterima", bg: "rgba(37,99,235,0.10)", text: "#1D4ED8", border: "rgba(37,99,235,0.25)", icon: Clock },
  in_progress: { label: "Sedang Diproses", bg: "rgba(8,145,178,0.10)", text: "#0E7490", border: "rgba(8,145,178,0.25)", icon: Clock },
  completed: { label: "Selesai", bg: "rgba(34,197,94,0.10)", text: "#15803D", border: "rgba(34,197,94,0.25)", icon: CheckCircle },
  cancelled: { label: "Dibatalkan", bg: "rgba(239,68,68,0.10)", text: "#B91C1C", border: "rgba(239,68,68,0.25)", icon: XCircle },
};

function SectionLabel({ icon, text, color = "#2563EB", bg = "rgba(37,99,235,0.08)", border = "rgba(37,99,235,0.20)" }) {
  return <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold" style={{ color, background: bg, border: `1px solid ${border}` }}>{icon} {text}</span>;
}

function JobStatusBadge({ status }) {
  const b = JOB_STATUS_MAP[status] || JOB_STATUS_MAP.pending;
  const Icon = b.icon;
  return <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0" style={{ background: b.bg, color: b.text, border: `1px solid ${b.border}` }}><Icon size={13} />{b.label}</span>;
}

const scoreColor = (score) => (score >= 70 ? "#16A34A" : score >= 50 ? "#D97706" : "#DC2626");

export default function InspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { url, caption, idx }

  useEffect(() => {
    api.get(`/v1/inspection-jobs/${id}`)
      .then(res => setJob(res.data?.data ?? res.data))
      .catch(err => setError(err.response?.data?.message || "Gagal memuat data inspeksi."))
      .finally(() => setLoading(false));
  }, [id]);

  const reload = () => window.location.reload();

  const handleDownloadPdf = async () => {
    if (!job?.report?.id) return;
    setPdfLoading(true);
    try {
      const res = await api.get(`/v1/inspection-reports/${job.report.id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, "_blank");
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return <div><Navbar /><div className={`${SECTION_X} py-8`}>Loading...</div></div>;
  if (error || !job) return <div><Navbar /><div className={`${SECTION_X} py-20`}>{error || "Data tidak ditemukan."}</div></div>;

  const report = job.report;
  // Hanya tampilkan form rating jika sudah selesai DAN belum pernah rating
  const alreadyRated = !!(job.buyer_rating ?? job.rating?.rating);
  const canRate = job.status === "completed" && !alreadyRated;

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      <Navbar />
      <main className={`${SECTION_X} py-8`}>
        <button onClick={() => navigate("/inspections")} className="inline-flex items-center gap-1 text-sm mb-6 font-medium" style={{ color: CLR_ACCENT }}>
          <ChevronLeft size={16} /> Kembali ke Riwayat Inspeksi
        </button>

        <div className="rounded-3xl overflow-hidden relative mb-6" style={{ background: GRAD_HERO_BG, border: `1px solid ${CLR_BORDER}` }}>
          <div className="relative px-6 sm:px-8 py-7">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div className="min-w-0">
                <SectionLabel icon={<ClipboardList size={11} />} text={`#${job.id}`} />
                <h1 className="text-xl sm:text-2xl mt-2 truncate" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}>
                  {job.laptop_brand} {job.laptop_model}
                </h1>
              </div>
              <JobStatusBadge status={job.status} />
            </div>
          </div>
        </div>

        {report && (
          <div className="rounded-3xl p-6 sm:p-8 space-y-7 mb-6" style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}` }}>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5" style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}>
              <div>
                <SectionLabel icon={<Sparkles size={11} />} text="Hasil Pemeriksaan" />
                <h2 className="text-xl mt-2" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
                  Laporan Inspeksi
                </h2>
              </div>
              <button onClick={handleDownloadPdf} disabled={pdfLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-[#0F172A]" style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}>
                <Download size={15} /> {pdfLoading ? "Memuat..." : "Unduh PDF"}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-6 text-center flex flex-col items-center justify-center" style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}` }}>
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: CLR_SUBTLE }}><Gauge size={12} /> Skor Keseluruhan</span>
                <p className="text-5xl font-extrabold leading-none" style={{ fontFamily: FONT_DISPLAY, color: scoreColor(report.overall_score) }}>{report.overall_score}</p>
              </div>
              <div className="rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3" style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}` }}>
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold" style={{ color: CLR_SUBTLE }}><ShieldCheck size={12} /> Rekomendasi</span>
                <span className="inline-block px-4 py-2 rounded-2xl text-sm font-semibold" style={{ background: RECOMMEND_STYLE[report.recommendation]?.bg, color: RECOMMEND_STYLE[report.recommendation]?.text, border: `1px solid ${RECOMMEND_STYLE[report.recommendation]?.border}` }}>
                  {RECOMMEND_STYLE[report.recommendation]?.label || report.recommendation}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(COMPONENT_LABELS).map(([key, { label, notesKey }]) => {
                const status = report[key];
                const notes  = report[notesKey];
                const style  = STATUS_STYLE[status] || { label: status, bg: "#F8FAFC", text: CLR_MUTED, border: CLR_BORDER_LT };
                return (
                  <div
                    key={key}
                    className="flex flex-col gap-2 rounded-2xl p-3.5"
                    style={{ background: "#FFFFFF", border: `1px solid ${notes ? style.border : CLR_BORDER_LT}` }}
                  >
                    <span className="text-[11px] font-medium" style={{ color: CLR_MUTED }}>{label}</span>
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full self-start"
                      style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                    >
                      {style.label}
                    </span>
                    {notes && (
                      <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: CLR_MUTED }}>
                        {notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {report.notes && (
              <p className="text-sm rounded-2xl p-4 whitespace-pre-wrap leading-relaxed" style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}`, color: CLR_MUTED }}>
                {report.notes}
              </p>
            )}

            {/* ══ GALERI FOTO BUKTI INSPEKSI ══ */}
            {report.photos && report.photos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4" style={{ borderTop: `1px solid ${CLR_BORDER_LT}`, paddingTop: "1.5rem" }}>
                  <Camera size={16} style={{ color: CLR_ACCENT }} />
                  <span className="text-sm font-semibold" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>
                    Foto Bukti Inspeksi
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-1"
                    style={{ background: "rgba(37,99,235,0.10)", color: CLR_ACCENT }}
                  >
                    {report.photos.length} foto
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {report.photos.map((photo, idx) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setLightbox({ url: photo.url, caption: photo.caption, idx })}
                      className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-100 transition hover:shadow-lg hover:scale-[1.02]"
                      style={{ border: `1.5px solid ${CLR_BORDER_LT}` }}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || `Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Overlay saat hover */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition"
                        style={{ background: "rgba(15,23,42,0.55)" }}
                      >
                        <ZoomIn size={20} color="#fff" />
                        <span className="text-[10px] font-semibold text-white">Lihat</span>
                      </div>
                      {/* Nomor urut */}
                      <span
                        className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(15,23,42,0.60)", color: "#fff" }}
                      >
                        {idx + 1}
                      </span>
                      {/* Caption bawah */}
                      {photo.caption && (
                        <div
                          className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                          style={{ background: "rgba(15,23,42,0.65)" }}
                        >
                          <p className="text-[10px] text-white leading-tight line-clamp-1">{photo.caption}</p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ LIGHTBOX ══ */}
        {lightbox && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setLightbox(null)}
          >
            <div
              className="relative max-w-3xl w-full flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tombol tutup */}
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="absolute -top-10 right-0 w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-110"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
              >
                <XIcon size={18} />
              </button>
              {/* Gambar */}
              <img
                src={lightbox.url}
                alt={lightbox.caption || `Foto ${lightbox.idx + 1}`}
                className="w-full max-h-[75vh] object-contain rounded-2xl"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
              />
              {/* Caption */}
              {lightbox.caption && (
                <p className="text-sm text-white text-center px-4" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                  {lightbox.caption}
                </p>
              )}
              <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.50)" }}>
                Foto {lightbox.idx + 1}
              </span>
            </div>
          </div>
        )}

        {/* Sudah dibayar / sedang diproses */}
        {(job.status === "in_progress" || job.payment?.status === "success") && (
          <div className="rounded-3xl p-5 mb-6 flex items-start gap-3" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
            <CheckCircle size={18} style={{ color: "#16A34A", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#15803D" }}>Pembayaran Berhasil</p>
              <p className="text-xs mt-0.5" style={{ color: "#166534" }}>Teknisi sedang melakukan inspeksi laptop Anda.</p>
            </div>
          </div>
        )}

        {/* Belum bayar - tampilkan hanya jika status accepted DAN payment belum success */}
        {job.status === "accepted" && job.payment?.status !== "success" && (
          <div className="rounded-3xl p-6 mb-6" style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}` }}>
            <p className="text-sm">Teknisi menerima. Silakan bayar untuk melanjutkan inspeksi.</p>
            <button
              onClick={async () => {
                try {
                  const res = await payInspectionJob(job.id);
                  const payment = res?.data?.data ?? res?.data ?? res;
                  if (payment?.snap_token && window.snap?.pay) {
                    window.snap.pay(payment.snap_token, { onSuccess: reload, onPending: reload, onError: reload, onClose: reload });
                  } else if (payment?.snap_redirect_url) {
                    window.open(payment.snap_redirect_url, "_blank");
                  }
                } catch (err) {
                  alert(err?.response?.data?.message || "Gagal membuat pembayaran.");
                }
              }}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white"
              style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}
            >
              <Wallet size={15} /> Bayar Teknisi
            </button>
          </div>
        )}

        {canRate && (
          <div className="mb-6">
            <InspectionRatingForm jobId={job.id} onSuccess={reload} />
          </div>
        )}

        {/* Rating sudah diberikan — tampilkan ringkasan */}
        {job.status === "completed" && alreadyRated && (
          <div
            className="rounded-3xl p-6 mb-6 space-y-4"
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
              className="rounded-2xl px-5 py-4 flex items-start gap-4 mt-3"
              style={{ background: "rgba(22,163,74,0.05)", border: "1px solid rgba(22,163,74,0.18)" }}
            >
              {/* Skor + bintang */}
              <div className="flex-shrink-0 text-center">
                <p
                  className="text-3xl font-extrabold leading-none"
                  style={{ fontFamily: FONT_DISPLAY, color: "#16A34A" }}
                >
                  {job.buyer_rating ?? job.rating?.rating}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-widest mt-1" style={{ color: "#15803D" }}>
                  / 5
                </p>
                <div className="flex gap-0.5 mt-2 justify-center">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const score = job.buyer_rating ?? job.rating?.rating ?? 0;
                    return (
                      <Star
                        key={n}
                        size={14}
                        style={
                          n <= score
                            ? { fill: "#F59E0B", color: "#F59E0B" }
                            : { fill: "rgba(148,163,184,0.3)", color: "#CBD5E1" }
                        }
                      />
                    );
                  })}
                </div>
              </div>

              <div className="w-px self-stretch" style={{ background: "rgba(22,163,74,0.2)" }} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={15} style={{ color: "#16A34A" }} />
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
      </main>
    </div>
  );
}
