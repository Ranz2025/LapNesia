import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, ClipboardCheck, Wallet, RefreshCw, ArrowRight, Sparkles, Zap, AlertCircle, CalendarDays, Clock, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import api from "../../services/api";
import { getUser } from "../../services/authService";

/* ─── DESIGN TOKENS (selaras dengan Home.jsx) ──────────────────── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const GRAD_CARD_BG = "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

const ICON_BG = {
  blue:   { background: "rgba(37,99,235,0.12)",  color: "#2563EB" },
  green:  { background: "rgba(16,185,129,0.12)", color: "#10B981" },
  orange: { background: "rgba(245,158,11,0.12)", color: "#D97706" },
};

/* ─── SECTION LABEL (sama seperti Home.jsx) ────────────────────── */
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

/* ─── STAT CARD ─────────────────────────────────────────────────── */
function StatCard({ icon, label, value, color = "blue" }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 px-6 py-7 text-center transition-colors hover:bg-[#EFF6FF]"
    >
      <span
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-1"
        style={ICON_BG[color]}
      >
        {icon}
      </span>
      <p
        className="text-2xl font-bold leading-none"
        style={{
          fontFamily: FONT_DISPLAY,
          backgroundImage: GRAD_PRIMARY,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: CLR_MUTED }}>{label}</p>
    </div>
  );
}

/* ─── QUICK ACTION CARD ─────────────────────────────────────────── */
function ActionCard({ icon, title, desc, badge, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl p-6 flex items-start gap-4 text-left w-full transition-all duration-300 hover:-translate-y-1"
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.boxShadow = `0 16px 40px -10px ${accent}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = CLR_BORDER_LT;
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)";
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
        style={{ background: GRAD_PRIMARY, boxShadow: "0 6px 18px rgba(37,99,235,0.28)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>{title}</h4>
          {badge > 0 && (
            <span
              className="text-[10px] rounded-full px-2 py-0.5 font-bold flex-shrink-0"
              style={{ background: "rgba(245,158,11,0.15)", color: "#D97706" }}
            >
              {badge} baru
            </span>
          )}
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: CLR_MUTED }}>{desc}</p>
      </div>
      <ArrowRight
        size={16}
        className="flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1"
        style={{ color: CLR_SUBTLE }}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = getUser();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobsRes, walletRes] = await Promise.allSettled([
        api.get("/v1/inspection-jobs"),
        api.get("/v1/wallet"),
      ]);
      const jobsPayload = jobsRes.status === "fulfilled" ? jobsRes.value.data?.data : [];
      const jobs = Array.isArray(jobsPayload?.data) ? jobsPayload.data : Array.isArray(jobsPayload) ? jobsPayload : [];
      const wallet = walletRes.status === "fulfilled" ? (walletRes.value.data?.data || {}) : {};
      const scheduled = jobs
        .filter(j => j.scheduled_by_technician && j.technician_schedule_date)
        .sort((a, b) => new Date(a.technician_schedule_date) - new Date(b.technician_schedule_date));
      setStats({
        totalJobs: jobs.length,
        pendingJobs: jobs.filter(j => j.status === "pending" || j.status === "assigned").length,
        completedJobs: jobs.filter(j => j.status === "completed").length,
        balance: Number(wallet.available_balance || 0),
        scheduledJobs: scheduled,
        noScheduleCount: jobs.filter(j => j.status === "accepted" && !j.scheduled_by_technician).length,
      });
    } catch {
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: FONT_BODY, background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />

      {/* Ambient glow backdrop, selaras dengan Home.jsx */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <main className={`${SECTION_X} pt-8 pb-14`}>

        {/* ══════════════ BANNER STATUS VERIFIKASI ══════════════ */}
        {user?.status === 'pending' && (
          <div
            className="mb-6 flex items-start gap-3 rounded-2xl px-5 py-4"
            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.30)" }}
          >
            <Clock size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#CA8A04" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#92400E" }}>Akun Menunggu Verifikasi</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#92400E" }}>
                Akun teknisi Anda sedang <strong>menunggu persetujuan admin</strong>. Silakan upload sertifikat di halaman profil untuk mempercepat proses verifikasi. Anda belum akan muncul di daftar teknisi publik hingga diverifikasi.
              </p>
            </div>
          </div>
        )}

        {user?.status === 'rejected' && (
          <div
            className="mb-6 flex items-start gap-3 rounded-2xl px-5 py-4"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <XCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#DC2626" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#DC2626" }}>Pendaftaran Ditolak</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#B91C1C" }}>
                Pendaftaran akun teknisi Anda telah <strong>ditolak oleh admin</strong>. Silakan hubungi admin untuk informasi lebih lanjut atau daftar ulang dengan data yang benar.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════ HERO HEADER ══════════════ */}
        <div
          className="rounded-3xl overflow-hidden relative mb-6"
          style={{ background: GRAD_HERO_BG, border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#06B6D4" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-10 py-8 sm:py-10">
            <div>
              <SectionLabel icon={<Zap size={11} />} text="Panel Teknisi" />
              <h1
                className="text-2xl sm:text-3xl leading-tight"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}
              >
                Dashboard{" "}
                <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  Teknisi
                </span>
              </h1>
              <p className="text-sm mt-2 max-w-md" style={{ color: CLR_MUTED }}>
                Pantau pekerjaan inspeksi dan saldo kamu dalam satu tempat.
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center justify-center gap-2 text-sm font-semibold rounded-2xl px-5 py-3 transition hover:brightness-110 active:scale-95 flex-shrink-0 disabled:opacity-60"
              style={{ background: "#FFFFFF", border: `1.5px solid ${CLR_BORDER}`, color: CLR_ACCENT, fontFamily: FONT_DISPLAY }}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* ══════════════ CONTENT ══════════════ */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div
            className="rounded-2xl p-10 text-center flex flex-col items-center"
            style={{ background: "#FFFFFF", border: "1px solid #FECACA" }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
              <AlertCircle size={22} />
            </div>
            <p className="mb-5 text-sm" style={{ color: "#DC2626" }}>{error}</p>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 text-sm font-semibold rounded-2xl px-6 py-3 transition hover:brightness-110 active:scale-95"
              style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY, boxShadow: "0 4px 20px rgba(37,99,235,0.30)" }}
            >
              <RefreshCw size={16} /> Coba Lagi
            </button>
          </div>
        ) : stats && (
          <>
            {/* Stat strip - sama gaya dengan STATS row di Home.jsx */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 rounded-2xl overflow-hidden mb-8"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 4px 24px rgba(37,99,235,0.06)" }}
            >
              <div style={{ borderRight: `1px solid ${CLR_BORDER_LT}` }}>
                <StatCard icon={<Briefcase size={20} />} label="Total Pekerjaan" value={stats.totalJobs} color="blue" />
              </div>
              <div className="sm:border-r" style={{ borderColor: CLR_BORDER_LT }}>
                <StatCard icon={<ClipboardCheck size={20} />} label="Selesai" value={stats.completedJobs} color="green" />
              </div>
              <div>
                <StatCard icon={<Wallet size={20} />} label="Saldo Tersedia" value={`Rp ${stats.balance.toLocaleString("id-ID")}`} color="orange" />
              </div>
            </div>

            {/* Section header untuk quick actions */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} style={{ color: CLR_ACCENT }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>
                Aksi Cepat
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionCard
                icon={<Briefcase size={20} />}
                title="Pekerjaan Inspeksi"
                desc="Lihat dan kelola daftar pekerjaan inspeksi yang ditugaskan kepadamu."
                badge={stats.pendingJobs}
                onClick={() => navigate("/technician/jobs")}
                accent="#2563EB"
              />
              <ActionCard
                icon={<Wallet size={20} />}
                title="Saldo & Withdraw"
                desc="Cek riwayat pendapatan dan tarik saldo ke rekening kamu."
                badge={0}
                onClick={() => navigate("/withdrawal")}
                accent="#0891B2"
              />
            </div>

            {/* ══════════════ PERINGATAN JOB BELUM DIJADWALKAN ══════════════ */}
            {stats.noScheduleCount > 0 && (
              <div
                className="flex items-start gap-3 rounded-2xl px-5 py-4 mt-6"
                style={{ background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.28)" }}
              >
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#CA8A04" }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "#92400E" }}>
                    {stats.noScheduleCount} job belum dijadwalkan
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#78350F" }}>
                    Hubungi seller dan segera input jadwal inspeksi dari halaman Pekerjaan Inspeksi.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/technician/jobs")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0 transition hover:brightness-110"
                  style={{ background: "rgba(234,179,8,0.18)", color: "#92400E" }}
                >
                  Lihat
                </button>
              </div>
            )}

            {/* ══════════════ JADWAL INSPEKSI ══════════════ */}
            <div className="flex items-center gap-2 mt-8 mb-4">
              <CalendarDays size={14} style={{ color: CLR_ACCENT }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CLR_MUTED }}>
                Jadwal Inspeksi Mendatang
              </h2>
            </div>

            {stats.scheduledJobs?.length === 0 ? (
              <div
                className="rounded-2xl p-8 text-center"
                style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}` }}
              >
                <CalendarDays size={28} className="mx-auto mb-3" style={{ color: CLR_SUBTLE }} />
                <p className="text-sm font-semibold mb-1" style={{ color: CLR_TEXT }}>Belum ada jadwal inspeksi</p>
                <p className="text-xs" style={{ color: CLR_MUTED }}>
                  Jadwal akan muncul di sini setelah kamu menginput jadwal dari halaman Pekerjaan Inspeksi.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.scheduledJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 p-4 rounded-2xl transition hover:-translate-y-0.5"
                    style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(37,99,235,0.10)", color: CLR_ACCENT }}
                    >
                      <CalendarDays size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>
                        {job.laptop_brand} {job.laptop_model}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs" style={{ color: CLR_MUTED }}>
                          <CalendarDays size={11} />
                          {new Date(job.technician_schedule_date).toLocaleDateString("id-ID", {
                            weekday: "short", day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        {job.technician_schedule_time && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: CLR_MUTED }}>
                            <Clock size={11} /> {job.technician_schedule_time.slice(0, 5)} WIB
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{
                        background: job.status === "completed" ? "rgba(16,185,129,0.12)" : "rgba(8,145,178,0.10)",
                        color:      job.status === "completed" ? "#059669" : "#0891B2",
                      }}
                    >
                      {job.status === "completed" ? "Selesai" : job.status === "in_progress" ? "Berlangsung" : "Dijadwalkan"}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => navigate("/technician/jobs")}
                  className="w-full text-sm font-semibold py-2.5 rounded-2xl transition hover:brightness-110"
                  style={{ background: "rgba(37,99,235,0.07)", border: `1px solid ${CLR_BORDER}`, color: CLR_ACCENT }}
                >
                  Lihat Semua Pekerjaan →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}