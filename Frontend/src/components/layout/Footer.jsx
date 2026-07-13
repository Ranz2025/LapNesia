// src/components/layout/Footer.jsx
import React from 'react';
import { Shield, ShoppingBag, CheckCircle, Mail, Share2, Play, ArrowUpRight, MapPin, Phone } from 'lucide-react';

/* ─── DESIGN TOKENS (selaras dengan Home.jsx) ───────────────── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

/* ─── STAMP SVG (sama dengan Home.jsx) ──────────────────────── */
function GradientStamp({ size = 52 }) {
  return (
    <div style={{ width: size, height: size, transform: "rotate(-12deg)" }} className="select-none flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="footerStampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#2563EB" />
            <stop offset="50%"  stopColor="#0891B2" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="url(#footerStampGrad)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#footerStampGrad)" strokeWidth="1" strokeDasharray="2 3" />
        <path d="M33 52 L45 64 L68 39" fill="none" stroke="url(#footerStampGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="80" textAnchor="middle" fontSize="7" fill="#06B6D4" fontWeight="700" letterSpacing="0.5">LULUS CEK</text>
      </svg>
    </div>
  );
}

const navLinks = [
  {
    title: "Tentang",
    links: [
      { label: "Tentang Kami", href: "#" },
      { label: "Karir", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Dukungan",
    links: [
      { label: "Kontak", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Bantuan", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

const trustBadges = [
  { icon: <Shield size={13} />, text: "Teknisi tersertifikasi" },
  { icon: <ShoppingBag size={13} />, text: "Escrow aman" },
  { icon: <CheckCircle size={13} />, text: "Informasi transparan" },
];

const contactInfo = [
  { icon: <MapPin size={13} />, text: "Yogyakarta, Indonesia" },
  { icon: <Phone size={13} />, text: "+62 812 3456 7890" },
  { icon: <Mail size={13} />, text: "lapnesia@gmail.com" },
];

const socials = [
  { icon: <Mail size={15} />, href: "#", label: "Instagram" },
  { icon: <Share2 size={15} />, href: "#", label: "Twitter" },
  { icon: <Play size={15} />, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer style={{ fontFamily: FONT_BODY }} className="relative">

      {/* ══════════ CTA strip — own section, no overlap hacks ══════════ */}
      <section className={`${SECTION_X} pt-10 sm:pt-12`}>
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl px-6 sm:px-10 py-7 relative overflow-hidden"
          style={{ background: GRAD_PRIMARY, boxShadow: "0 16px 40px -12px rgba(37,99,235,0.40)" }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />

          <div className="relative text-center sm:text-left">
            <p className="text-[15px] sm:text-lg font-bold text-white" style={{ fontFamily: FONT_DISPLAY }}>
              Siap temukan laptop bekas idamanmu?
            </p>
            <p className="text-xs sm:text-sm text-white/80 mt-1">Teknisi tersertifikasi, escrow aman, informasi transparan.</p>
          </div>
          <a
            href="/laptop"
            className="relative inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition hover:brightness-110 active:scale-95"
            style={{ background: "#FFFFFF", color: CLR_ACCENT, fontFamily: FONT_DISPLAY }}
          >
            Mulai Belanja <ArrowUpRight size={15} />
          </a>
        </div>
      </section>

      {/* ══════════ Footer body ══════════ */}
      <div className="relative overflow-hidden mt-10" style={{ borderTop: `1px solid ${CLR_BORDER_LT}`, background: "#FFFFFF" }}>

        {/* Ambient glow, kept inside footer body so it can't bleed into sections above */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -bottom-24 -left-16 w-[360px] h-[360px] rounded-full opacity-15 blur-[120px]" style={{ background: "#93C5FD" }} />
          <div className="absolute -top-20 right-0 w-[320px] h-[320px] rounded-full opacity-15 blur-[120px]" style={{ background: "#67E8F9" }} />
        </div>

        {/* ══════════ Top grid ══════════ */}
        <div className={`${SECTION_X} pt-12 pb-12`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

            {/* Brand col */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <GradientStamp size={44} />
                <span
                  className="text-2xl"
                  style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, letterSpacing: "-0.5px", color: CLR_TEXT }}
                >
                  LAPNESIA
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: CLR_MUTED, maxWidth: 300 }}>
                Belanja laptop bekas lebih aman dengan informasi produk yang transparan, dan dapat diinspeksi oleh teknisi tersertifikasi.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2">
                {trustBadges.map(({ icon, text }) => (
                  <span
                    key={text}
                    className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-full"
                    style={{ color: CLR_ACCENT, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)" }}
                  >
                    {icon} {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div className="md:col-span-5 grid grid-cols-3 gap-6 sm:gap-8">
              {navLinks.map(({ title, links }) => (
                <div key={title} className="min-w-0">
                  <h4
                    className="text-xs font-bold uppercase tracking-widest mb-4 whitespace-nowrap"
                    style={{
                      backgroundImage: GRAD_PRIMARY,
                      WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                      fontFamily: FONT_DISPLAY,
                    }}
                  >
                    {title}
                  </h4>
                  <ul className="space-y-3">
                    {links.map(({ label, href }) => (
                      <li key={label} className="whitespace-nowrap overflow-hidden text-ellipsis">
                        <a
                          href={href}
                          className="text-sm transition-colors hover:text-blue-600 block truncate"
                          style={{ color: CLR_MUTED }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = CLR_ACCENT)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = CLR_MUTED)}
                          title={label}
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contact + socials col */}
            <div className="md:col-span-3">
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{
                  backgroundImage: GRAD_PRIMARY,
                  WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                  fontFamily: FONT_DISPLAY,
                }}
              >
                Kontak
              </h4>
              <ul className="space-y-3 mb-6">
                {contactInfo.map(({ icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm" style={{ color: CLR_MUTED }}>
                    <span style={{ color: CLR_ACCENT }}>{icon}</span> {text}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2.5">
                {socials.map(({ icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: "#F8FAFC", border: `1px solid ${CLR_BORDER_LT}`, color: CLR_MUTED }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(37,99,235,0.08)";
                      e.currentTarget.style.borderColor = CLR_BORDER;
                      e.currentTarget.style.color = CLR_ACCENT;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#F8FAFC";
                      e.currentTarget.style.borderColor = CLR_BORDER_LT;
                      e.currentTarget.style.color = CLR_MUTED;
                    }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ Bottom bar ══════════ */}
        <div style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
          <div className={`${SECTION_X} py-5 flex flex-col sm:flex-row items-center justify-between gap-3`}>
            <p className="text-xs" style={{ color: CLR_SUBTLE }}>
              © 2026 LAPNESIA. Semua hak dilindungi.
            </p>
            <div className="flex items-center gap-5">
              <a href="#" className="text-xs transition-colors" style={{ color: CLR_SUBTLE }}>Privacy Policy</a>
              <a href="#" className="text-xs transition-colors" style={{ color: CLR_SUBTLE }}>Terms of Service</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}