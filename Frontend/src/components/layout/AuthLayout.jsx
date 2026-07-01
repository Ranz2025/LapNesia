// src/components/layout/AuthLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const GRADIENT = "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)";
const BORDER = "#E2E8F0";
const TEXT_MUTED = "#64748B";
const TEXT_BODY = "#475569";

function GradientStamp({ size = 44 }) {
  return (
    <div style={{ width: size, height: size, transform: "rotate(-10deg)" }} className="select-none flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="authStampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="url(#authStampGrad)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="url(#authStampGrad)" strokeWidth="1" strokeDasharray="2 3" />
        <path d="M35 52 L46 63 L67 40" fill="none" stroke="url(#authStampGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="78" textAnchor="middle" fontSize="6.5" fill="#2563EB" fontWeight="700" letterSpacing="0.5">LULUS CEK</text>
      </svg>
    </div>
  );
}

/* Ambient orbs — purely decorative */
function AmbientOrbs() {
  return (
    <>
      <div
        style={{
          position: "absolute", top: "-80px", left: "-80px",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: "-60px", right: "-60px",
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

const AuthLayout = ({ children, title, subtitle, features, illustration }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "#F0F9FF",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Full-page ambient glow */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 20% 40%, rgba(37,99,235,0.12) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(6,182,212,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-stretch gap-8 min-h-[580px]">

        {/* ── Left panel ── */}
        <div className="hidden lg:flex flex-col flex-1 px-6 py-10 justify-between relative overflow-hidden">
          <AmbientOrbs />

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 relative z-10">
            <GradientStamp size={42} />
            <div>
              <p
                className="text-xl leading-tight"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}
              >
                LAP<span
                  style={{
                    backgroundImage: GRADIENT,
                    WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                  }}
                >NESIA</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: TEXT_MUTED }}>
                Laptop &amp; Inspeksi
              </p>
            </div>
          </Link>

          {/* Headline + Features */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-xs tracking-widest uppercase" style={{ color: "#60A5FA" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2563EB" }} />
              Platform laptop bekas terverifikasi
            </div>
            <h1
              className="text-4xl leading-[1.1] mb-4"
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
            >
              <span style={{color:"#0F172A"}}>{title}</span>
            </h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: TEXT_BODY, maxWidth: 340 }}>
              {subtitle}
            </p>

            <div className="space-y-3">
              {features?.map((feat) => (
                <div
                  key={feat.title}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 transition-colors"
                  style={{
                    background: "#F8FAFC",
                    border: `1px solid ${BORDER}`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA" }}
                  >
                    {feat.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">{feat.title}</p>
                    <p className="text-xs" style={{ color: TEXT_MUTED }}>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          {illustration && (
            <div className="w-full flex items-end justify-center mt-4 relative z-10">
              {illustration}
            </div>
          )}
        </div>

        {/* ── Right panel: Form ── */}
        <div
          className="w-full lg:w-[460px] flex-shrink-0 rounded-2xl p-8 sm:p-10 flex flex-col justify-center relative overflow-hidden"
          style={{
            background: "#F8FAFC",
            border: `1px solid ${BORDER}`,
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Subtle inner glow top-right */}
          <div
            style={{
              position: "absolute", top: -60, right: -60,
              width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Mobile-only logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden relative z-10">
            <GradientStamp size={36} />
            <p
              className="text-lg"
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: "#0F172A" }}
            >
              LAP<span
                style={{
                  backgroundImage: GRADIENT,
                  WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                }}
              >NESIA</span>
            </p>
          </Link>

          <div className="relative z-10">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;