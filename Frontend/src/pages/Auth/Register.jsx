import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Tag, HeadphonesIcon, EyeOff, Eye, UserPlus, Zap, ChevronDown } from 'lucide-react';
import { register } from '../../services/authService';

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

const INPUT_BASE = { background: "#F8FAFC", border: `1.5px solid #E2E8F0`, color: "#0F172A" };

const FEATURES = [
  { icon: <ShieldCheck size={18} />,     title: "Transaksi Aman",  desc: "Sistem escrow 100% aman dan terpercaya" },
  { icon: <Tag size={18} />,             title: "Harga Terbaik",   desc: "Penawaran terbaik setiap hari" },
  { icon: <HeadphonesIcon size={18} />,  title: "Support 24/7",    desc: "Tim siap membantu kapan saja" },
];

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '', role: 'buyer' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!formData.name || formData.name.length < 3)       return setError('Nama harus minimal 3 karakter');
    if (!formData.email || !formData.email.includes('@'))  return setError('Email tidak valid');
    if (!formData.phone || formData.phone.length < 10)     return setError('Nomor telepon harus minimal 10 karakter');
    if (formData.password.length < 8)                      return setError('Password harus minimal 8 karakter');
    if (formData.password !== formData.password_confirmation) return setError('Password tidak cocok');

    setLoading(true);
    try {
      const result = await register({ name: formData.name.trim(), email: formData.email.trim().toLowerCase(), phone: formData.phone.trim(), password: formData.password, password_confirmation: formData.password_confirmation, role: formData.role, address: '' });
      if (result.success && result.data) {
        localStorage.setItem("token", result.data.access_token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        setTimeout(() => navigate('/'), 500);
      } else { setError(result.message || 'Registrasi gagal'); }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat registrasi');
    } finally { setLoading(false); }
  };

  const focusAccent = (e) => (e.target.style.borderColor = CLR_ACCENT);
  const blurDefault = (e) => (e.target.style.borderColor = CLR_BORDER_LT);

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

      {/* grid-cols replaces flex so both panels share the row's height equally; form panel is naturally taller here (more fields) than Login's, so a slightly narrower left ratio keeps proportions sane */}
      <div
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] rounded-3xl overflow-hidden items-stretch"
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

          {/* flex-1 + justify-center centers this block in the leftover space rather than pinning to the top */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-5 w-fit" style={{ color: CLR_ACCENT, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)" }}>
              <Zap size={11} /> Bergabung sekarang
            </span>
            <h1 className="text-3xl leading-[1.15] mb-4" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
              Buat Akun &<br />
              <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Mulai Pengalaman!</span>
            </h1>
            <p className="text-[14px] leading-relaxed mb-8 max-w-sm" style={{ color: CLR_MUTED }}>
              Daftar sekarang dan temukan berbagai laptop berkualitas dengan harga terbaik dan garansi terpercaya.
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
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: GRAD_PRIMARY }}>{icon}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm" style={{ color: CLR_TEXT }}>{title}</p>
                    <p className="text-xs" style={{ color: CLR_MUTED }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="p-8 sm:p-10 flex flex-col justify-center" style={{ background: "#FFFFFF" }}>

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}>L</div>
            <p className="font-bold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
              Lap<span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Nesia</span>
            </p>
          </Link>

          {/* Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 flex-shrink-0" style={{ background: "linear-gradient(160deg, #DBEAFE 0%, #BFDBFE 100%)", border: `1px solid ${CLR_BORDER}` }}>
              <UserPlus size={26} style={{ color: CLR_ACCENT }} />
            </div>
            <h2 className="text-xl font-bold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>Daftar Akun Baru</h2>
            <p className="text-sm mt-1" style={{ color: CLR_MUTED }}>Isi data diri untuk membuat akun LapNesia</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", color: "#DC2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Nama + Email side-by-side on wider screens to shorten the form's overall height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_TEXT }}>Nama Lengkap</label>
                <input type="text" name="name" placeholder="Nama lengkap Anda"
                  value={formData.name} onChange={handleChange}
                  className="w-full rounded-xl p-2.5 text-sm outline-none transition placeholder:text-[#94A3B8]"
                  style={INPUT_BASE} onFocus={focusAccent} onBlur={blurDefault} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_TEXT }}>Email</label>
                <input type="email" name="email" placeholder="nama@email.com"
                  value={formData.email} onChange={handleChange}
                  className="w-full rounded-xl p-2.5 text-sm outline-none transition placeholder:text-[#94A3B8]"
                  style={INPUT_BASE} onFocus={focusAccent} onBlur={blurDefault} required />
              </div>
            </div>

            {/* Phone + Role side-by-side too */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_TEXT }}>Nomor Telepon</label>
                <input type="tel" name="phone" placeholder="0812xxxxxxxx" minLength="10" maxLength="20"
                  value={formData.phone} onChange={handleChange}
                  className="w-full rounded-xl p-2.5 text-sm outline-none transition placeholder:text-[#94A3B8]"
                  style={INPUT_BASE} onFocus={focusAccent} onBlur={blurDefault} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_TEXT }}>Daftar Sebagai</label>
                <div className="relative">
                  <select name="role" value={formData.role} onChange={handleChange}
                    className="w-full rounded-xl p-2.5 pr-9 text-sm outline-none transition"
                    style={{ ...INPUT_BASE, appearance: "none" }}
                    onFocus={focusAccent} onBlur={blurDefault}>
                    <option value="buyer">Pembeli</option>
                    <option value="seller">Penjual</option>
                    <option value="technician">Teknisi</option>
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: CLR_SUBTLE }} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_TEXT }}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password"
                  placeholder="Min. 8 karakter" minLength="8"
                  value={formData.password} onChange={handleChange}
                  className="w-full rounded-xl p-2.5 pr-10 text-sm outline-none transition placeholder:text-[#94A3B8]"
                  style={INPUT_BASE} onFocus={focusAccent} onBlur={blurDefault} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition" style={{ color: CLR_SUBTLE }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = CLR_ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = CLR_SUBTLE)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: CLR_SUBTLE }}>Harus mengandung huruf besar, kecil, dan angka</p>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_TEXT }}>Konfirmasi Password</label>
              <input type="password" name="password_confirmation" placeholder="Ulangi password Anda"
                value={formData.password_confirmation} onChange={handleChange}
                className="w-full rounded-xl p-2.5 text-sm outline-none transition placeholder:text-[#94A3B8]"
                style={INPUT_BASE} onFocus={focusAccent} onBlur={blurDefault} required />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 pt-1">
              <input type="checkbox" className="mt-0.5 flex-shrink-0" style={{ accentColor: CLR_ACCENT }} required />
              <span className="text-sm" style={{ color: CLR_MUTED }}>
                Saya setuju dengan{' '}
                <a href="#" className="font-medium hover:underline" style={{ color: CLR_ACCENT }}>Syarat & Ketentuan</a>
                {' '}dan{' '}
                <a href="#" className="font-medium hover:underline" style={{ color: CLR_ACCENT }}>Kebijakan Privasi</a>
              </span>
            </label>

            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl py-2.5 font-semibold text-[#0F172A] text-sm transition hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 4px 20px rgba(37,99,235,0.30)" }}
            >
              {loading ? 'Sedang Daftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: CLR_MUTED }}>
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: CLR_ACCENT }}>Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;