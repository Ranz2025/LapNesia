import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ClipboardCheck, Battery, Monitor, Keyboard, Square,
  Usb, HardDrive, MemoryStick, Cpu, Box, Gauge, ThumbsUp,
  AlertTriangle, ThumbsDown, FileText, Send, Zap
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { toast } from "../../components/ui/Toast";
import api from "../../services/api";

/* ─── DESIGN TOKENS (selaras dengan halaman lain) ──────────────── */
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

const SECTION_X = "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8";

const STATUS_OPTIONS = [
  { value: "good",            label: "Baik",            icon: <ThumbsUp size={13} />,    color: "#059669", bg: "rgba(16,185,129,0.10)",  border: "rgba(16,185,129,0.35)" },
  { value: "needs_attention", label: "Perlu Perhatian", icon: <AlertTriangle size={13} />, color: "#D97706", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.35)" },
  { value: "faulty",          label: "Rusak",           icon: <ThumbsDown size={13} />,  color: "#DC2626", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.35)" },
];

const COMPONENTS = [
  { key: "battery_status",  label: "Baterai",  icon: <Battery size={16} /> },
  { key: "screen_status",   label: "Layar",    icon: <Monitor size={16} /> },
  { key: "keyboard_status", label: "Keyboard", icon: <Keyboard size={16} /> },
  { key: "touchpad_status", label: "Touchpad", icon: <Square size={16} /> },
  { key: "port_status",     label: "Port",     icon: <Usb size={16} /> },
  { key: "storage_status",  label: "Storage",  icon: <HardDrive size={16} /> },
  { key: "ram_status",      label: "RAM",      icon: <MemoryStick size={16} /> },
  { key: "cpu_status",      label: "CPU",      icon: <Cpu size={16} /> },
  { key: "physical_status", label: "Fisik",    icon: <Box size={16} /> },
];

const RECOMMENDATIONS = [
  { value: "recommended",     label: "Direkomendasikan",      desc: "Unit dalam kondisi baik dan layak dijual.",   icon: <ThumbsUp size={18} />,    color: "#059669", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.30)" },
  { value: "fix_required",    label: "Perlu Perbaikan",       desc: "Ada komponen yang harus diperbaiki dulu.",    icon: <AlertTriangle size={18} />, color: "#D97706", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.30)" },
  { value: "not_recommended", label: "Tidak Direkomendasikan", desc: "Unit tidak layak untuk dijual ke buyer.",    icon: <ThumbsDown size={18} />,  color: "#DC2626", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.30)" },
];

const defaultForm = () => ({
  ...Object.fromEntries(COMPONENTS.map(c => [c.key, "good"])),
  overall_score: "",
  recommendation: "recommended",
  notes: "",
});

/* ─── SECTION LABEL ─────────────────────────────────────────────── */
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

/* ─── COMPONENT STATUS ROW ──────────────────────────────────────── */
function ComponentRow({ icon, label, value, onChange }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl"
      style={{ background: "#F8FAFC", border: `1px solid ${CLR_BORDER_LT}` }}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(37,99,235,0.10)", color: CLR_ACCENT }}>
          {icon}
        </span>
        <span className="text-sm font-medium" style={{ color: CLR_TEXT }}>{label}</span>
      </div>
      <div className="flex gap-1.5">
        {STATUS_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition"
              style={{
                background: active ? opt.bg : "#FFFFFF",
                color: active ? opt.color : CLR_SUBTLE,
                border: `1.5px solid ${active ? opt.border : CLR_BORDER_LT}`,
              }}
            >
              {opt.icon} <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function SubmitReport() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm());
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const setComponentStatus = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/v1/inspection-reports", { ...form, job_id: jobId, overall_score: Number(form.overall_score) });
      toast.success("Laporan berhasil dikirim!");
      setTimeout(() => navigate("/technician/jobs"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim laporan.");
    } finally {
      setSubmitting(false);
    }
  };

  const summary = useMemo(() => {
    const counts = { good: 0, needs_attention: 0, faulty: 0 };
    COMPONENTS.forEach(c => { counts[form[c.key]] = (counts[form[c.key]] || 0) + 1; });
    return counts;
  }, [form]);

  return (
    <div style={{ fontFamily: FONT_BODY, background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />

      {/* Ambient glow backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <main className={`${SECTION_X} pt-8 pb-16`}>

        <button
          onClick={() => navigate("/technician/jobs")}
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-5 transition hover:gap-2.5"
          style={{ color: CLR_ACCENT }}
        >
          <ArrowLeft size={15} /> Kembali ke Daftar Job
        </button>

        {/* ══════════════ HERO HEADER ══════════════ */}
        <div
          className="rounded-3xl overflow-hidden relative mb-6"
          style={{ background: GRAD_HERO_BG, border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#06B6D4" }} />

          <div className="relative flex items-center gap-4 px-6 sm:px-10 py-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: GRAD_PRIMARY, boxShadow: "0 8px 24px rgba(37,99,235,0.28)" }}
            >
              <ClipboardCheck size={24} />
            </div>
            <div>
              <SectionLabel icon={<Zap size={11} />} text="Laporan Inspeksi" />
              <h1
                className="text-2xl sm:text-3xl leading-tight"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}
              >
                Upload{" "}
                <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  Laporan
                </span>
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ══════════════ KOMPONEN ══════════════ */}
          <div
            className="rounded-2xl p-5 sm:p-7"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <h2 className="text-base font-semibold" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>
                Status Komponen
              </h2>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 font-semibold" style={{ color: "#059669" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#059669" }} /> {summary.good} Baik
                </span>
                <span className="flex items-center gap-1 font-semibold" style={{ color: "#D97706" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#D97706" }} /> {summary.needs_attention} Perhatian
                </span>
                <span className="flex items-center gap-1 font-semibold" style={{ color: "#DC2626" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#DC2626" }} /> {summary.faulty} Rusak
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {COMPONENTS.map(({ key, label, icon }) => (
                <ComponentRow
                  key={key}
                  icon={icon}
                  label={label}
                  value={form[key]}
                  onChange={(v) => setComponentStatus(key, v)}
                />
              ))}
            </div>
          </div>

          {/* ══════════════ SKOR KESELURUHAN ══════════════ */}
          <div
            className="rounded-2xl p-5 sm:p-7"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
          >
            <h2 className="text-base font-semibold mb-1 flex items-center gap-2" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>
              <Gauge size={17} style={{ color: CLR_ACCENT }} /> Skor Keseluruhan
            </h2>
            <p className="text-[12px] mb-4" style={{ color: CLR_MUTED }}>Berikan nilai dari 0 sampai 100 untuk kondisi unit secara umum.</p>
            <div className="relative max-w-[200px]">
              <input
                type="number"
                name="overall_score"
                min="0"
                max="100"
                required
                value={form.overall_score}
                onChange={handleChange}
                placeholder="85"
                className="w-full outline-none rounded-2xl pl-4 pr-12 py-3 text-lg font-bold placeholder:text-[#CBD5E1] transition"
                style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT, fontFamily: FONT_DISPLAY }}
                onFocus={(e) => e.currentTarget.style.borderColor = CLR_ACCENT}
                onBlur={(e) => e.currentTarget.style.borderColor = CLR_BORDER_LT}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: CLR_SUBTLE }}>/ 100</span>
            </div>
          </div>

          {/* ══════════════ REKOMENDASI ══════════════ */}
          <div
            className="rounded-2xl p-5 sm:p-7"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>
              Rekomendasi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RECOMMENDATIONS.map((opt) => {
                const active = form.recommendation === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, recommendation: opt.value }))}
                    className="flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition"
                    style={{
                      background: active ? opt.bg : "#F8FAFC",
                      border: `1.5px solid ${active ? opt.border : CLR_BORDER_LT}`,
                    }}
                  >
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: active ? "#FFFFFF" : "rgba(148,163,184,0.12)", color: active ? opt.color : CLR_SUBTLE }}
                    >
                      {opt.icon}
                    </span>
                    <span className="text-[13px] font-semibold" style={{ color: active ? opt.color : CLR_TEXT }}>
                      {opt.label}
                    </span>
                    <span className="text-[11px] leading-snug" style={{ color: CLR_MUTED }}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ══════════════ CATATAN ══════════════ */}
          <div
            className="rounded-2xl p-5 sm:p-7"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
          >
            <h2 className="text-base font-semibold mb-1 flex items-center gap-2" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>
              <FileText size={17} style={{ color: CLR_ACCENT }} /> Catatan Tambahan
            </h2>
            <p className="text-[12px] mb-4" style={{ color: CLR_MUTED }}>Opsional — tuliskan temuan detail yang perlu diketahui buyer.</p>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Contoh: Engsel sedikit longgar di sisi kanan, baterai health 89%..."
              className="w-full outline-none rounded-2xl px-4 py-3 text-sm placeholder:text-[#94A3B8] resize-none transition"
              style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
              onFocus={(e) => e.currentTarget.style.borderColor = CLR_ACCENT}
              onBlur={(e) => e.currentTarget.style.borderColor = CLR_BORDER_LT}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[#0F172A] font-semibold transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 6px 24px rgba(37,99,235,0.30)" }}
          >
            {submitting ? (
              "Mengirim..."
            ) : (
              <>
                <Send size={17} /> Kirim Laporan
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}