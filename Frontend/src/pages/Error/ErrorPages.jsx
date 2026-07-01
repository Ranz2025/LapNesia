import { useNavigate } from "react-router-dom";
import { Home, RefreshCw, ArrowLeft, SearchX, ServerCrash, LifeBuoy } from "lucide-react";

/* ─── DESIGN TOKENS (selaras dengan Home.jsx / OrderHistory.jsx) ──── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_RED      = "linear-gradient(135deg, #F87171 0%, #DC2626 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#64748B";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

/* ─── Ambient glow backdrop, selaras dengan halaman lain ─── */
function AmbientBg({ tone = "blue" }) {
  const c1 = tone === "red" ? "#FCA5A5" : "#93C5FD";
  const c2 = tone === "red" ? "#FECACA" : "#67E8F9";
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#F8FAFC" }}>
      <div className="absolute -top-32 -right-16 w-[420px] h-[420px] rounded-full opacity-20 blur-[130px]" style={{ background: c1 }} />
      <div className="absolute top-[55%] -left-20 w-[360px] h-[360px] rounded-full opacity-15 blur-[130px]" style={{ background: c2 }} />
    </div>
  );
}

/* ─── Big glyph illustration with floating badge ─── */
function CodeGlyph({ code, grad, icon, badgeBg }) {
  return (
    <div className="relative inline-block mb-4">
      <p
        className="text-7xl sm:text-8xl font-extrabold select-none leading-none"
        style={{
          fontFamily: FONT_DISPLAY,
          backgroundImage: grad,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {code}
      </p>
      <div
        className="absolute -bottom-3 -right-3 sm:-right-5 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white"
        style={{ background: badgeBg, boxShadow: "0 10px 24px -8px rgba(0,0,0,0.25)", transform: "rotate(-8deg)" }}
      >
        {icon}
      </div>
    </div>
  );
}

function ErrorShell({ tone, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4" style={{ fontFamily: FONT_BODY }}>
      <AmbientBg tone={tone} />
      <div
        className="w-full max-w-md rounded-3xl px-7 sm:px-10 py-12 text-center relative overflow-hidden"
        style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 24px 60px -24px rgba(15,23,42,0.15)" }}
      >
        {children}
      </div>
    </div>
  );
}

export function NotFound() {
  const nav = useNavigate();
  return (
    <ErrorShell tone="blue">
      <CodeGlyph
        code="404"
        grad={GRAD_PRIMARY}
        icon={<SearchX size={22} />}
        badgeBg={GRAD_PRIMARY}
      />

      <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
        Halaman Tidak Ditemukan
      </h1>
      <p className="mb-8 max-w-sm mx-auto text-sm" style={{ color: CLR_MUTED }}>
        Halaman yang kamu cari tidak ada, sudah dipindahkan, atau mungkin alamatnya salah ketik.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => nav("/")}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white text-sm transition hover:brightness-105 active:scale-95"
          style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 10px 24px -10px rgba(37,99,235,0.5)" }}
        >
          <Home size={15} /> Kembali ke Beranda
        </button>
        <button
          onClick={() => nav(-1)}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition hover:bg-[#F8FAFC]"
          style={{ color: CLR_MUTED, border: `1px solid ${CLR_BORDER_LT}`, fontFamily: FONT_DISPLAY }}
        >
          <ArrowLeft size={15} /> Halaman Sebelumnya
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-7 pt-6" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
        <LifeBuoy size={12} style={{ color: "#94A3B8" }} />
        <p className="text-[11px]" style={{ color: "#94A3B8" }}>
          Butuh bantuan? Hubungi tim support kami.
        </p>
      </div>
    </ErrorShell>
  );
}

export function ServerError() {
  return (
    <ErrorShell tone="red">
      <CodeGlyph
        code="500"
        grad={GRAD_RED}
        icon={<ServerCrash size={22} />}
        badgeBg={GRAD_RED}
      />

      <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
        Terjadi Kesalahan Server
      </h1>
      <p className="mb-8 max-w-sm mx-auto text-sm" style={{ color: CLR_MUTED }}>
        Server sedang mengalami gangguan sementara. Tim kami sudah diberi tahu, coba lagi dalam beberapa saat.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white text-sm transition hover:brightness-105 active:scale-95"
          style={{ background: GRAD_RED, fontFamily: FONT_DISPLAY, boxShadow: "0 10px 24px -10px rgba(220,38,38,0.45)" }}
        >
          <RefreshCw size={15} /> Muat Ulang
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition hover:bg-[#F8FAFC]"
          style={{ color: CLR_MUTED, border: `1px solid ${CLR_BORDER_LT}`, fontFamily: FONT_DISPLAY }}
        >
          <Home size={15} /> Ke Beranda
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-7 pt-6" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
        <LifeBuoy size={12} style={{ color: "#94A3B8" }} />
        <p className="text-[11px]" style={{ color: "#94A3B8" }}>
          Masalah berlanjut? Hubungi tim support kami.
        </p>
      </div>
    </ErrorShell>
  );
}