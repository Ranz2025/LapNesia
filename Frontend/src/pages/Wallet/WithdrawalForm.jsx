import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { createWithdrawal } from "../../services/withdrawalService";
import {
  CheckCircle2, ArrowDownToLine, Banknote, User, Hash,
  AlertCircle, Zap, ShieldCheck, Clock, Send, ChevronLeft
} from "lucide-react";

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

const SECTION_X = "max-w-xl mx-auto px-4 sm:px-6";

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

/* ─── FIELD WRAPPER WITH ICON ───────────────────────────────────── */
function Field({ icon, label, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: CLR_MUTED }}>
        <span style={{ color: CLR_ACCENT }}>{icon}</span> {label}
      </label>
      {children}
    </div>
  );
}

const baseInputStyle = {
  width: "100%",
  background: "#F8FAFC",
  border: `1.5px solid ${CLR_BORDER_LT}`,
  borderRadius: "1rem",
  padding: "0.75rem 1rem",
  color: CLR_TEXT,
  outline: "none",
  fontSize: "0.875rem",
  transition: "border-color 0.15s",
};

function StyledInput(props) {
  return (
    <input
      {...props}
      style={baseInputStyle}
      onFocus={(e) => { e.currentTarget.style.borderColor = CLR_ACCENT; props.onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; props.onBlur?.(e); }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function WithdrawalForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "", bank_name: "", account_name: "", account_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createWithdrawal(formData);
      setSuccess(true);
      setFormData({ amount: "", bank_name: "", account_name: "", account_number: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error creating withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  /* ══════════════ SUCCESS STATE ══════════════ */
  if (success) {
    return (
      <div style={{ fontFamily: FONT_BODY, background: "#F8FAFC", minHeight: "100vh" }}>
        <Navbar />
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
          <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
        </div>

        <div className={`${SECTION_X} pt-20`}>
          <div
            className="rounded-3xl p-10 text-center relative overflow-hidden"
            style={{ background: "#FFFFFF", border: "1px solid rgba(16,185,129,0.25)", boxShadow: "0 8px 40px rgba(16,185,129,0.10)" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#10B981" }} />
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative"
              style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", boxShadow: "0 8px 24px rgba(16,185,129,0.30)" }}
            >
              <CheckCircle2 size={28} className="text-white" />
            </div>
            <h2 className="text-xl mb-2 relative" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}>
              Permintaan Terkirim!
            </h2>
            <p className="text-sm mb-7 relative max-w-xs mx-auto" style={{ color: CLR_MUTED }}>
              Permintaan penarikan dana kamu sedang diproses. Dana akan masuk dalam 1–3 hari kerja.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative">
              <button
                onClick={() => navigate(-1)}
                className="text-sm px-6 py-3 rounded-2xl font-semibold transition hover:brightness-95 active:scale-95 flex items-center gap-2"
                style={{
                  background: "rgba(37,99,235,0.08)",
                  border: "1px solid rgba(37,99,235,0.20)",
                  color: "#2563EB",
                  fontFamily: FONT_DISPLAY,
                }}
              >
                <ChevronLeft size={16} /> Kembali
              </button>
              <button
                onClick={() => setSuccess(false)}
                className="text-sm px-7 py-3 rounded-2xl font-semibold text-white transition hover:brightness-110 active:scale-95"
                style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 16px rgba(37,99,235,0.28)" }}
              >
                Buat Penarikan Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════ FORM STATE ══════════════ */
  return (
    <div style={{ fontFamily: FONT_BODY, background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />

      {/* Ambient glow backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <main className={`${SECTION_X} pt-8 pb-16`}>

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
              <ArrowDownToLine size={24} />
            </div>
            <div>
              <SectionLabel icon={<Zap size={11} />} text="Wallet Teknisi" />
              <h1
                className="text-2xl sm:text-3xl leading-tight"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}
              >
                Penarikan{" "}
                <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  Dana
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* ══════════════ TRUST STRIP ══════════════ */}
        <div
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <div
            className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}` }}
          >
            <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(37,99,235,0.10)", color: CLR_ACCENT }}>
              <ShieldCheck size={15} />
            </span>
            <span className="text-[11px] leading-tight font-medium" style={{ color: CLR_MUTED }}>Transaksi aman & terenkripsi</span>
          </div>
          <div
            className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}` }}
          >
            <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(8,145,178,0.10)", color: "#0891B2" }}>
              <Clock size={15} />
            </span>
            <span className="text-[11px] leading-tight font-medium" style={{ color: CLR_MUTED }}>Diproses 1–3 hari kerja</span>
          </div>
        </div>

        {error && (
          <div
            className="rounded-2xl p-4 mb-5 text-sm flex items-start gap-2.5"
            style={{ background: "#FFFFFF", border: "1px solid #FECACA", color: "#DC2626" }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ══════════════ FORM CARD ══════════════ */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 sm:p-7 space-y-5"
          style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
        >
          <Field icon={<Banknote size={13} />} label="Jumlah Penarikan">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: CLR_SUBTLE }}></span>
              <StyledInput
                type="number"
                placeholder="Minimal 10.000"
                value={formData.amount}
                onChange={set("amount")}
                required
                min="10000"
                style={{ ...baseInputStyle, paddingLeft: "2.25rem" }}
              />
            </div>
          </Field>

          <Field icon={<Banknote size={13} />} label="Nama Bank">
            <StyledInput
              type="text"
              placeholder="Contoh: BCA, Mandiri, BNI"
              value={formData.bank_name}
              onChange={set("bank_name")}
              required
            />
          </Field>

          <Field icon={<User size={13} />} label="Nama Pemegang Rekening">
            <StyledInput
              type="text"
              placeholder="Sesuai rekening bank"
              value={formData.account_name}
              onChange={set("account_name")}
              required
            />
          </Field>

          <Field icon={<Hash size={13} />} label="Nomor Rekening">
            <StyledInput
              type="text"
              placeholder="Nomor rekening tujuan"
              value={formData.account_number}
              onChange={set("account_number")}
              required
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-[#0F172A] transition hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 6px 24px rgba(37,99,235,0.30)" }}
          >
            {loading ? (
              "Memproses..."
            ) : (
              <>
                <Send size={16} /> Kirim Permintaan
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}