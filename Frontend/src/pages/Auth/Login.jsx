import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Tag, HeadphonesIcon, EyeOff, Eye, User, Lock, Zap } from 'lucide-react';
import { login } from '../../services/authService';

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";
const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO    = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const CLR_TEXT     = "#0F172A";
const CLR_MUTED    = "#64748B";
const CLR_SUBTLE   = "#94A3B8";
const CLR_BORDER   = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT   = "#2563EB";

function GradientStamp({ size = 52 }) {
  return (
    <div style={{ width: size, height: size, transform: "rotate(-12deg)" }} className="select-none flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="sgLogin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#2563EB" />
            <stop offset="50%"  stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="url(#sgLogin)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#sgLogin)" strokeWidth="1" strokeDasharray="2 3" />
        <path d="M33 52 L45 64 L68 39" fill="none" stroke="url(#sgLogin)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="80" textAnchor="middle" fontSize="7" fill="#0EA5E9" fontWeight="700" letterSpacing="0.5">LULUS CEK</text>
      </svg>
    </div>
  );
}

const FEATURES = [
  { icon: <ShieldCheck size={18} />,    title: "Transaksi Aman", desc: "Sistem escrow 100% aman dan terpercaya" },
  { icon: <Tag size={18} />,            title: "Harga Terbaik",  desc: "Penawaran terbaik setiap hari" },
  { icon: <HeadphonesIcon size={18} />, title: "Support 24/7",   desc: "Tim siap membantu kapan saja" },
];

const Login = () => {
  const [formData, setFormData]       = useState({ email: '', password: '' });
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange  = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const result = await login(formData);
      if (result.success && result.data) {
        const user = result.data.user;
        const redirectMap = { admin: '/admin/dashboard', owner: '/owner/dashboard', seller: '/seller/dashboard', technician: '/technician/dashboard', buyer: '/' };
        navigate(redirectMap[user?.role] || '/', { replace: true });
      } else {
        setError(result.message || 'Login gagal');
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)[0];
        setError(Array.isArray(first) ? first[0] : first);
      } else {
        setError(err.response?.data?.message || 'Email atau password salah.');
      }
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

      {/* grid-cols replaces flex so both panels share the row's height equally instead of the form panel dictating it */}
      <div
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] rounded-3xl overflow-hidden items-stretch"
        style={{ boxShadow: "0 24px 80px -20px rgba(37,99,235,0.20)" }}
      >

        {/* ── Left panel ── */}
        <div
          className="hidden lg:flex flex-col p-10 relative overflow-hidden"
          style={{ background: GRAD_HERO, borderRight: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-10 left-10 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#0EA5E9" }} />

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 relative z-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}>L</div>
            <div>
              <p className="text-[16px] font-bold leading-tight" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
                Lap<span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Nesia</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: CLR_MUTED }}>Laptop & Inspeksi</p>
            </div>
          </Link>

          {/* flex-1 + justify-center centers this block vertically in the leftover space, instead of pinning to the top */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-5 w-fit" style={{ color: CLR_ACCENT, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)" }}>
              <Zap size={11} /> Platform terverifikasi
            </span>
            <h1 className="text-3xl leading-[1.15] mb-4" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}>
              <span style={{ color: CLR_TEXT }}>Selamat Datang</span><br />
              <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Kembali!</span>
            </h1>
            <p className="text-[14px] leading-relaxed mb-8 max-w-sm" style={{ color: CLR_MUTED }}>
              Masuk untuk melanjutkan pengalaman terbaik berbelanja laptop bekas terinspeksi di LapNesia.
            </p>

            <div className="space-y-3">
              {FEATURES.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
                  style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = CLR_ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = CLR_BORDER)}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: GRAD_PRIMARY }}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm" style={{ color: CLR_TEXT }}>{title}</p>
                    <p className="text-xs" style={{ color: CLR_MUTED }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stamp decoration */}
          <div className="mt-8 flex justify-center relative z-10">
            <GradientStamp size={72} />
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div
          className="p-8 sm:p-12 flex flex-col justify-center"
          style={{ background: "#FFFFFF" }}
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}>L</div>
            <p className="font-bold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
              Lap<span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Nesia</span>
            </p>
          </Link>

          {/* Header */}
          <div className="flex flex-col items-center mb-7 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 flex-shrink-0" style={{ background: "linear-gradient(160deg, #DBEAFE 0%, #BFDBFE 100%)", border: `1px solid ${CLR_BORDER}` }}>
              <User size={26} style={{ color: CLR_ACCENT }} />
            </div>
            <h2 className="text-xl font-bold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>Masuk ke Akun</h2>
            <p className="text-sm mt-1" style={{ color: CLR_MUTED }}>Akses akun LapNesia Anda</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#DC2626" }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_TEXT }}>Email atau Nomor Telepon</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: CLR_SUBTLE }} />
                <input
                  type="text" name="email"
                  placeholder="contoh@email.com atau 0812xxxxxxxx"
                  value={formData.email} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition placeholder:text-[#94A3B8]"
                  style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
                  onFocus={(e) => (e.target.style.borderColor = CLR_ACCENT)}
                  onBlur={(e)  => (e.target.style.borderColor = CLR_BORDER_LT)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_TEXT }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: CLR_SUBTLE }} />
                <input
                  type={showPassword ? 'text' : 'password'} name="password"
                  placeholder="Masukkan password Anda"
                  value={formData.password} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition placeholder:text-[#94A3B8]"
                  style={{ background: "#F8FAFC", border: `1.5px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
                  onFocus={(e) => (e.target.style.borderColor = CLR_ACCENT)}
                  onBlur={(e)  => (e.target.style.borderColor = CLR_BORDER_LT)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition" style={{ color: CLR_SUBTLE }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = CLR_ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = CLR_SUBTLE)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" style={{ accentColor: CLR_ACCENT }} />
                <span className="text-sm" style={{ color: CLR_MUTED }}>Ingat saya</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium hover:underline" style={{ color: CLR_ACCENT }}>
                Lupa password?
              </Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl py-2.5 font-semibold text-[#0F172A] text-sm transition hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 20px rgba(37,99,235,0.30)" }}
            >
              {loading ? 'Sedang Masuk...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: CLR_MUTED }}>
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: CLR_ACCENT }}>Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;