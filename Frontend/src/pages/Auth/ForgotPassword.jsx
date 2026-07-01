import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ShieldCheck, KeyRound, CheckCircle } from "lucide-react";
import { forgotPassword } from "../../services/authService";

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";
const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const CLR_TEXT     = "#0F172A";
const CLR_MUTED    = "#64748B";
const CLR_SUBTLE   = "#94A3B8";
const CLR_BORDER   = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT   = "#2563EB";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan. Coba lagi.");
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)", fontFamily: FONT_BODY }}
    >
      {/* ambient glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-96 h-96 rounded-full opacity-30 blur-[120px]" style={{ background: "#93C5FD" }} />
        <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full opacity-20 blur-[120px]" style={{ background: "#67E8F9" }} />
      </div>

      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 80px -20px rgba(37,99,235,0.20)" }}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: GRAD_PRIMARY }} />

        <div className="p-8 sm:p-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}>L</div>
            <p className="font-bold text-[15px]" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
              Lap<span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Nesia</span>
            </p>
          </Link>

          {/* ── SUCCESS STATE ── */}
          {sent ? (
            <div className="flex flex-col items-center text-center py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0"
                style={{ background: "linear-gradient(160deg, #ECFDF5 0%, #D1FAE5 100%)", border: "1px solid #A7F3D0" }}
              >
                <CheckCircle size={30} style={{ color: "#059669" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>Email Terkirim!</h2>
              <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: CLR_MUTED }}>
                Jika email{" "}
                <strong style={{ color: CLR_TEXT, wordBreak: "break-word" }}>{email}</strong>{" "}
                terdaftar, link reset password telah dikirimkan. Periksa folder inbox atau spam.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-[#0F172A] transition hover:brightness-110"
                style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 16px rgba(37,99,235,0.28)" }}
              >
                <ArrowLeft size={15} /> Kembali ke Login
              </Link>
            </div>

          ) : (
            /* ── FORM STATE ── */
            <>
              {/* Icon + heading */}
              <div className="flex flex-col items-center mb-7 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 flex-shrink-0"
                  style={{ background: "linear-gradient(160deg, #DBEAFE 0%, #BFDBFE 100%)", border: `1px solid ${CLR_BORDER}` }}
                >
                  <KeyRound size={26} style={{ color: CLR_ACCENT }} />
                </div>
                <h1 className="text-2xl font-bold mb-2 leading-tight" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
                  Lupa Password?{" "}
                  <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                    Kami Bantu!
                  </span>
                </h1>
                <p className="text-sm max-w-xs" style={{ color: CLR_MUTED }}>
                  Masukkan email terdaftar — kami kirimkan link reset password ke inbox Anda.
                </p>
              </div>

              {/* Info card */}
              <div
                className="flex items-center gap-3 mb-6 p-3.5 rounded-xl"
                style={{ background: "rgba(37,99,235,0.05)", border: `1px solid rgba(37,99,235,0.18)` }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(37,99,235,0.10)", color: CLR_ACCENT }}
                >
                  <ShieldCheck size={18} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: CLR_MUTED }}>
                  Keamanan akun Anda adalah prioritas kami. Link reset hanya berlaku 60 menit.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_TEXT }}>Alamat Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: CLR_SUBTLE }} />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh@email.com" required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition placeholder:text-[#94A3B8]"
                      style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
                      onFocus={(e) => (e.target.style.borderColor = CLR_ACCENT)}
                      onBlur={(e)  => (e.target.style.borderColor = CLR_BORDER_LT)}
                    />
                  </div>
                </div>

                {/* Boxed error, matching the style used on Login/Register instead of bare red text */}
                {error && (
                  <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#DC2626" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full rounded-xl py-2.5 font-semibold text-[#0F172A] text-sm transition hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 20px rgba(37,99,235,0.28)" }}
                >
                  {loading ? "Mengirim..." : "Kirim Link Reset Password"}
                </button>

                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition"
                  style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_MUTED }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = CLR_ACCENT; e.currentTarget.style.color = CLR_ACCENT; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.color = CLR_MUTED; }}
                >
                  <ArrowLeft size={15} /> Kembali ke Login
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}