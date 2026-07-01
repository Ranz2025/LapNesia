import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { KeyRound, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { resetPassword } from "../../services/authService";

/* ─── DESIGN TOKENS (sama dengan Login/Register/ForgotPassword) ─ */
const FONT_DISPLAY  = "'Baloo 2', sans-serif";
const FONT_BODY     = "'Inter', sans-serif";
const GRAD_PRIMARY  = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#64748B";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const focusAccent  = (e) => (e.target.style.borderColor = CLR_ACCENT);
const blurDefault  = (e) => (e.target.style.borderColor = CLR_BORDER_LT);

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = params.get("token");
  const email = params.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password harus minimal 8 karakter.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, email, password, password_confirmation: confirmation });
      navigate("/login?reset=success");
    } catch (err) {
      setError(err.response?.data?.message || "Link tidak valid atau sudah kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Invalid / missing link state ── */
  if (!token || !email) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-10"
        style={{ background: "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)", fontFamily: FONT_BODY }}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -right-16 w-96 h-96 rounded-full opacity-30 blur-[120px]" style={{ background: "#93C5FD" }} />
          <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full opacity-20 blur-[120px]" style={{ background: "#67E8F9" }} />
        </div>

        <div
          className="w-full max-w-md rounded-3xl overflow-hidden"
          style={{ background: "#FFFFFF", boxShadow: "0 24px 80px -20px rgba(37,99,235,0.20)" }}
        >
          <div className="h-1.5 w-full" style={{ background: GRAD_PRIMARY }} />
          <div className="p-8 sm:p-10 flex flex-col items-center text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 flex-shrink-0"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <AlertCircle size={26} style={{ color: "#DC2626" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
              Link Tidak Valid
            </h2>
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: CLR_MUTED }}>
              Link reset password ini tidak valid atau sudah kedaluwarsa. Silakan minta link baru.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-[#0F172A] transition hover:brightness-110"
              style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 16px rgba(37,99,235,0.28)" }}
            >
              Minta Link Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)", fontFamily: FONT_BODY }}
    >
      {/* ambient glows, consistent with the other auth pages */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-96 h-96 rounded-full opacity-30 blur-[120px]" style={{ background: "#93C5FD" }} />
        <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full opacity-20 blur-[120px]" style={{ background: "#67E8F9" }} />
      </div>

      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 80px -20px rgba(37,99,235,0.20)" }}
      >
        <div className="h-1.5 w-full" style={{ background: GRAD_PRIMARY }} />

        <div className="p-8 sm:p-10">
          {/* Logo, matching the boxed-L mark used on every other auth page instead of plain wordmark */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}>L</div>
            <p className="font-bold text-[15px]" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
              Lap<span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Nesia</span>
            </p>
          </Link>

          <div className="flex flex-col items-center mb-7 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 flex-shrink-0"
              style={{ background: "linear-gradient(160deg, #DBEAFE 0%, #BFDBFE 100%)", border: `1px solid ${CLR_BORDER}` }}
            >
              <KeyRound size={26} style={{ color: CLR_ACCENT }} />
            </div>
            <h1 className="text-2xl leading-[1.15] mb-2" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}>
              <span style={{ color: CLR_TEXT }}>Atur Ulang </span>
              <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Password
              </span>
            </h1>
            <p className="text-sm max-w-xs" style={{ color: CLR_MUTED }}>
              Buat password baru yang kuat untuk akun Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              {/* label color was near-invisible (#C7C7D6 on white); now matches the rest of the site */}
              <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_TEXT }}>
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                  required
                  className="w-full pr-10 px-4 py-2.5 rounded-xl text-sm outline-none transition placeholder:text-[#94A3B8]"
                  style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
                  onFocus={focusAccent}
                  onBlur={blurDefault}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                  style={{ color: CLR_SUBTLE }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = CLR_ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = CLR_SUBTLE)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_TEXT }}>
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  className="w-full pr-10 px-4 py-2.5 rounded-xl text-sm outline-none transition placeholder:text-[#94A3B8]"
                  style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
                  onFocus={focusAccent}
                  onBlur={blurDefault}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                  style={{ color: CLR_SUBTLE }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = CLR_ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = CLR_SUBTLE)}
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* error box now uses red, matching every other form on the site instead of an off-brand cyan/blue combo */}
            {error && (
              <div
                className="p-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#DC2626" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 font-semibold text-[#0F172A] text-sm transition disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
              style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 20px rgba(37,99,235,0.28)" }}
            >
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
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
        </div>
      </div>
    </div>
  );
}