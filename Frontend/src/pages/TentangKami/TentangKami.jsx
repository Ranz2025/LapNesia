import { useNavigate } from "react-router-dom";
import { Shield, ShoppingBag, CheckCircle, Users, Sparkles, Target, Award, Heart, ArrowRight, Zap, MapPin } from "lucide-react";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";
const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO    = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const GRAD_CTA_BG  = "radial-gradient(ellipse at 20% 20%, rgba(37,99,235,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.12) 0%, transparent 60%), linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)";
const CLR_TEXT     = "#0F172A";
const CLR_MUTED    = "#64748B";
const CLR_BORDER   = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT   = "#2563EB";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
const SECTION_Y = "py-6 md:py-8";

function GradientStamp({ size = 80 }) {
  return (
    <div style={{ width: size, height: size, transform: "rotate(-12deg)" }} className="select-none flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="sgTK" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#2563EB" />
            <stop offset="50%"  stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="url(#sgTK)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#sgTK)" strokeWidth="1" strokeDasharray="2 3" />
        <path d="M33 52 L45 64 L68 39" fill="none" stroke="url(#sgTK)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="80" textAnchor="middle" fontSize="7" fill="#0EA5E9" fontWeight="700" letterSpacing="0.5">LULUS CEK</text>
      </svg>
    </div>
  );
}

/* Reusable eyebrow label so spacing/typography stays identical everywhere it's used */
function Eyebrow({ icon, text, color = CLR_ACCENT, bg = "rgba(37,99,235,0.08)", border = "rgba(37,99,235,0.20)" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-4"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {icon} {text}
    </span>
  );
}

const STATS = [
  { value: "2026",   label: "Tahun Berdiri" },
  { value: "5.000+", label: "Laptop Terjual" },
  { value: "4.9/5",  label: "Rating Pengguna" },
  { value: "98%",    label: "Pembeli Puas" },
];

const MISI = [
  { icon: <ShoppingBag size={22} />, title: "Kualitas Terbaik",     desc: "Menyediakan laptop berkualitas dengan harga yang kompetitif dan transparan.",        accent: "#2563EB" },
  { icon: <CheckCircle size={22} />, title: "Informasi Transparan", desc: "Laporan inspeksi lengkap oleh teknisi tersertifikasi sehingga pembeli tahu persis kondisi unit.",        accent: "#1D4ED8" },
  { icon: <Shield size={22} />,      title: "Transaksi Aman",       desc: "Sistem escrow memastikan pembayaran ditahan hingga kamu konfirmasi unit.",            accent: "#0891B2" },
  { icon: <Users size={22} />,       title: "Satu Ekosistem",       desc: "Mendukung penjual dan pembeli dalam platform yang adil dan terpercaya.",              accent: "#06B6D4" },
];

const TEAM = [
  { name: "Tim Teknisi", role: "Inspeksi & Verifikasi", icon: <Award size={20} />,  accent: "#2563EB" },
  { name: "Tim Produk",  role: "Platform & Fitur",      icon: <Target size={20} />, accent: "#1D4ED8" },
  { name: "Tim Support", role: "Layanan Pelanggan",     icon: <Heart size={20} />,  accent: "#0EA5E9" },
];

export default function TentangKami() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: FONT_BODY }}>

      {/* ══════════════ AMBIENT GLOW BACKDROP ══════════════ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      {/* ── Hero ── */}
      <section className={`${SECTION_X} pt-8 pb-6`}>
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: GRAD_HERO, border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#0EA5E9" }} />

          {/* grid keeps both columns vertically centered against each other instead of relying on flex auto-sizing */}
          <div className="relative grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] items-center gap-10 px-6 sm:px-10 md:px-14 py-12 md:py-16">

            {/* Left */}
            <div className="min-w-0 order-2 lg:order-1">
              <Eyebrow icon={<Sparkles size={11} />} text="Mengenal lebih dekat LapNesia" />
              <h1 className="text-4xl md:text-5xl leading-[1.1] mb-5" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}>
                Tentang{" "}
                <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  LapNesia
                </span>
              </h1>
              <p className="text-[15px] leading-relaxed max-w-lg mb-6" style={{ color: CLR_MUTED }}>
                LapNesia adalah platform jual beli laptop bekas dengan pemeriksaan ketat oleh teknisi
                terverifikasi. Kami hadir untuk memberikan pengalaman transaksi yang mudah, aman, dan
                terpercaya — menghubungkan pembeli dan penjual di seluruh Indonesia.
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {[
                  { icon: <MapPin size={13} />, text: "Melayani seluruh Indonesia" },
                  { icon: <Shield size={13} />, text: "Teknisi tersertifikasi" },
                  { icon: <CheckCircle size={13} />, text: "Escrow aman" },
                ].map(({ icon, text }) => (
                  <span key={text} className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: CLR_MUTED }}>
                    <span style={{ color: CLR_ACCENT }}>{icon}</span>
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Right illustration */}
            <div className="order-1 lg:order-2 flex-shrink-0 relative flex items-center justify-center">
              <div
                className="w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #BFDBFE 100%)", border: `1px solid ${CLR_BORDER}`, boxShadow: "0 20px 60px -20px rgba(37,99,235,0.25)" }}
              >
                <span className="text-5xl select-none" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  LN
                </span>
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4">
                <GradientStamp size={72} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={`${SECTION_X} ${SECTION_Y}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="px-5 py-7 text-center rounded-2xl transition-colors hover:bg-[#EFF6FF]"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 4px 24px rgba(37,99,235,0.06)" }}
            >
              <p className="text-2xl font-bold mb-1" style={{ fontFamily: FONT_DISPLAY, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                {value}
              </p>
              <p className="text-xs" style={{ color: CLR_MUTED }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Visi ── */}
      <section className={`${SECTION_X} ${SECTION_Y}`}>
        <div
          className="rounded-2xl px-6 sm:px-8 py-10 relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)", border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#06B6D4" }} />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-8">
            <div>
              <Eyebrow icon={<Target size={11} />} text="Visi Kami" />
              <h2 className="text-2xl md:text-3xl mb-3 leading-tight" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
                Marketplace laptop{" "}
                <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  #1 di Indonesia.
                </span>
              </h2>
              <p className="text-[15px] leading-relaxed max-w-2xl" style={{ color: CLR_MUTED }}>
                Menjadi marketplace laptop bekas terpercaya di Indonesia yang menghubungkan pembeli dan
                penjual secara aman, transparan, dan efisien — sehingga setiap orang bisa mendapatkan
                laptop impian tanpa rasa khawatir.
              </p>
            </div>
            <div
              className="hidden lg:flex w-24 h-24 rounded-3xl items-center justify-center text-white flex-shrink-0"
              style={{ background: GRAD_PRIMARY, boxShadow: "0 12px 32px rgba(37,99,235,0.30)" }}
            >
              <Target size={36} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Misi ── */}
      <section className={`${SECTION_X} ${SECTION_Y}`}>
        <Eyebrow icon={<Sparkles size={11} />} text="Misi Kami" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
          {MISI.map(({ icon, title, desc, accent }) => (
            <div
              key={title}
              className="rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 16px 40px -10px ${accent}30`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 flex-shrink-0" style={{ background: accent, boxShadow: `0 4px 14px ${accent}40` }}>
                {icon}
              </div>
              <h3 className="font-semibold text-base mb-2" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: CLR_MUTED }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tim ── */}
      <section className={`${SECTION_X} ${SECTION_Y}`}>
        <Eyebrow icon={<Users size={11} />} text="Tim Kami" color="#0E7490" bg="rgba(8,145,178,0.08)" border="rgba(8,145,178,0.20)" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
          {TEAM.map(({ name, role, icon, accent }) => (
            <div
              key={name}
              className="rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 16px 40px -10px ${accent}30`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = CLR_BORDER_LT; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 flex-shrink-0" style={{ background: accent, boxShadow: `0 6px 18px ${accent}40` }}>
                {icon}
              </div>
              <h4 className="font-semibold text-base mb-1" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>{name}</h4>
              <p className="text-xs" style={{ color: CLR_MUTED }}>{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Penutup ── */}
      <section className={`${SECTION_X} pb-16`}>
        <div
          className="rounded-3xl px-6 sm:px-10 md:px-16 py-14 text-center relative overflow-hidden"
          style={{ background: GRAD_CTA_BG, border: `1px solid ${CLR_BORDER}`, boxShadow: "0 8px 40px rgba(37,99,235,0.10)" }}
        >
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#06B6D4" }} />

          <div className="relative z-10 flex flex-col items-center">
            <Eyebrow icon={<Zap size={11} />} text="Bergabung Sekarang" />
            <h2 className="text-2xl md:text-4xl mb-4 max-w-xl" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}>
              Mau Jual atau Beli{" "}
              <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Laptop?
              </span>
            </h2>
            <p className="text-sm max-w-md mx-auto mb-8 leading-relaxed" style={{ color: CLR_MUTED }}>
              Jadilah bagian dari ribuan pengguna yang sudah merasakan transaksi laptop bekas yang aman dan transparan bersama LapNesia.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/laptop")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold text-[#0F172A] transition hover:brightness-110 active:scale-95"
                style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 6px 24px rgba(37,99,235,0.35)" }}
              >
                <ShoppingBag size={16} /> Mulai Belanja
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold transition hover:bg-[#EFF6FF]"
                style={{ color: CLR_ACCENT, border: `1.5px solid ${CLR_BORDER}`, background: "#FFFFFF", fontFamily: FONT_DISPLAY }}
              >
                Hubungi Kami <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}