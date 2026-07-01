import { useEffect, useState } from "react";
import { CheckCircle, XCircle, User, RefreshCw, ExternalLink, Wrench, Sparkles, FileCheck2, Clock } from "lucide-react";
import { getPendingTechnicians, approveTechnician, rejectTechnician, getTechnicianCertification } from "../../services/adminService";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";

/* ─── DESIGN TOKENS (selaras dengan Home.jsx / AdminDashboard.jsx) ── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_GREEN   = "linear-gradient(135deg, #34D399 0%, #059669 100%)";
const GRAD_RED     = "linear-gradient(135deg, #F87171 0%, #DC2626 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#64748B";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const SECTION_X = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8";

const STATUS_LABELS = { pending: "Menunggu", verified: "Terverifikasi", rejected: "Ditolak", active: "Aktif", suspended: "Ditangguhkan" };
const STATUS_STYLE = {
  pending:   { bg: "rgba(234,158,12,0.10)",  fg: "#CA8A04", icon: <Clock size={12} /> },
  verified:  { bg: "rgba(16,185,129,0.10)",  fg: "#10B981", icon: <CheckCircle size={12} /> },
  active:    { bg: "rgba(16,185,129,0.10)",  fg: "#10B981", icon: <CheckCircle size={12} /> },
  rejected:  { bg: "rgba(220,38,38,0.10)",   fg: "#DC2626", icon: <XCircle size={12} /> },
  suspended: { bg: "rgba(100,116,139,0.10)", fg: "#64748B", icon: <Clock size={12} /> },
};

const FILTERS = [
  { key: "pending",  label: "Menunggu" },
  { key: "verified", label: "Terverifikasi" },
  { key: "rejected", label: "Ditolak" },
  { key: "all",      label: "Semua" },
];

const initialsOf = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

const AVATAR_GRADS = [
  "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
  "linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)",
  "linear-gradient(135deg, #C084FC 0%, #9333EA 100%)",
  "linear-gradient(135deg, #FB923C 0%, #EA580C 100%)",
  "linear-gradient(135deg, #34D399 0%, #059669 100%)",
];
const avatarGradFor = (str = "") => {
  const code = [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADS[code % AVATAR_GRADS.length];
};

export default function TechnicianVerification() {
  const [technicians, setTechnicians] = useState([]);
  const [filter, setFilter]           = useState("pending");
  const [loading, setLoading]         = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason]           = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPendingTechnicians(filter);
      setTechnicians(res.data?.data || []);
    } catch { toast.error("Gagal memuat data teknisi."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await approveTechnician(id);
      toast.success("Teknisi berhasil diverifikasi.");
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Gagal."); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!reason.trim() || reason.length < 10) { toast.error("Alasan minimal 10 karakter."); return; }
    setActionLoading(true);
    try {
      await rejectTechnician(rejectModal, reason);
      toast.success("Teknisi ditolak.");
      setRejectModal(null); setReason("");
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Gagal."); }
    finally { setActionLoading(false); }
  };

  const handleOpenCertification = async (id) => {
    try {
      const blob = await getTechnicianCertification(id);
      const url = URL.createObjectURL(new Blob([blob], { type: blob.type || "application/octet-stream" }));
      window.open(url, "_blank", "noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal membuka sertifikat.");
    }
  };

  const pendingCount = technicians.filter((t) => t.status === "pending").length;

  return (
    <div style={{ fontFamily: FONT_BODY }} className="relative min-h-screen overflow-hidden">

      {/* Ambient glow backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#F8FAFC" }}>
        <div className="absolute -top-32 -right-16 w-[420px] h-[420px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[360px] h-[360px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <div className={`${SECTION_X} py-8`}>

        {/* ══════════ Hero Header ══════════ */}
        <div
          className="relative rounded-3xl overflow-hidden mb-8 px-6 sm:px-9 py-8"
          style={{ background: GRAD_PRIMARY, boxShadow: "0 16px 40px -16px rgba(37,99,235,0.45)" }}
        >
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />
          <div className="absolute -bottom-14 -left-10 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-3"
                style={{ color: "#FFFFFF", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)" }}
              >
                <Wrench size={11} /> Manajemen Teknisi
              </span>
              <h1 className="text-2xl md:text-3xl mb-1.5 text-white" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }}>
                Verifikasi Teknisi
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                Kelola dan setujui pendaftaran teknisi baru di platform LapNesia.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {filter === "pending" && pendingCount > 0 && (
                <span
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.25)" }}
                >
                  <Sparkles size={13} /> {pendingCount} menunggu tindakan
                </span>
              )}
              <button
                onClick={load}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                style={{ background: "#FFFFFF", color: CLR_ACCENT, fontFamily: FONT_DISPLAY }}
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ══════════ Filter pills ══════════ */}
        <div className="flex gap-2 flex-wrap items-center mb-6">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200"
              style={
                filter === key
                  ? { background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY, boxShadow: "0 6px 16px -6px rgba(37,99,235,0.5)" }
                  : { background: "#FFFFFF", color: CLR_MUTED, border: `1px solid ${CLR_BORDER_LT}` }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* ══════════ Table / List ══════════ */}
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : technicians.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(37,99,235,0.08)" }}
            >
              <Wrench size={24} style={{ color: CLR_ACCENT }} />
            </div>
            <p className="text-sm" style={{ color: CLR_MUTED }}>Tidak ada teknisi dengan status ini.</p>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead style={{ background: "#F8FAFC" }}>
                  <tr style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}>
                    {["Teknisi", "Kontak", "Status", "Sertifikat", "Aksi"].map((h) => (
                      <th key={h} className="px-6 py-3.5 font-semibold text-[11px] uppercase tracking-wide" style={{ color: CLR_SUBTLE }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {technicians.map((t, idx) => {
                    const st = STATUS_STYLE[t.status] || STATUS_STYLE.suspended;
                    return (
                      <tr
                        key={t.id}
                        className="transition-colors hover:bg-[#F8FAFC]"
                        style={{ borderBottom: idx === technicians.length - 1 ? "none" : `1px solid ${CLR_BORDER_LT}` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: avatarGradFor(t.name || `${t.id}`), boxShadow: "0 4px 10px rgba(37,99,235,0.25)" }}
                            >
                              {initialsOf(t.name)}
                            </div>
                            <span className="font-semibold" style={{ color: CLR_TEXT }}>{t.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p style={{ color: CLR_MUTED }}>{t.email}</p>
                          <p className="text-xs mt-0.5" style={{ color: CLR_SUBTLE }}>{t.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: st.bg, color: st.fg }}
                          >
                            {st.icon}
                            {STATUS_LABELS[t.status] || t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {t.technician_profile?.certification_url ? (
                            <button
                              type="button"
                              onClick={() => handleOpenCertification(t.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition hover:brightness-95"
                              style={{ background: "rgba(37,99,235,0.08)", color: CLR_ACCENT }}
                            >
                              <FileCheck2 size={13} /> Lihat <ExternalLink size={11} />
                            </button>
                          ) : (
                            <span className="text-xs" style={{ color: CLR_SUBTLE }}>Belum ada</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            {/* Tombol Setujui: tampil jika pending atau rejected */}
                            {(t.status === "pending" || t.status === "rejected") && (
                              <button
                                onClick={() => handleApprove(t.id)}
                                disabled={actionLoading}
                                className="flex items-center gap-1 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                                style={{ background: GRAD_GREEN, boxShadow: "0 4px 12px -4px rgba(5,150,105,0.5)" }}
                              >
                                <CheckCircle size={14} /> Setujui
                              </button>
                            )}
                            {/* Tombol Tolak: tampil jika pending, verified, atau active */}
                            {(t.status === "pending" || t.status === "verified" || t.status === "active") && (
                              <button
                                onClick={() => setRejectModal(t.id)}
                                disabled={actionLoading}
                                className="flex items-center gap-1 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                                style={{ background: GRAD_RED, boxShadow: "0 4px 12px -4px rgba(220,38,38,0.5)" }}
                              >
                                <XCircle size={14} /> Tolak
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ Reject Modal ══════════ */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div
            className="rounded-2xl p-6 w-full max-w-md relative overflow-hidden"
            style={{ background: "#FFFFFF", boxShadow: "0 24px 60px -16px rgba(0,0,0,0.35)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: GRAD_RED }} />

            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(220,38,38,0.10)" }}
              >
                <XCircle size={20} style={{ color: "#DC2626" }} />
              </div>
              <h2 className="text-lg font-bold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
                Tolak Teknisi
              </h2>
            </div>
            <p className="text-sm mb-4 mt-3" style={{ color: CLR_MUTED }}>
              Berikan alasan penolakan (minimal 10 karakter):
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl p-3 text-sm outline-none transition resize-none"
              style={{ background: "#F8FAFC", border: `1px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
              onFocus={(e) => (e.target.style.borderColor = "#DC2626")}
              onBlur={(e) => (e.target.style.borderColor = CLR_BORDER_LT)}
              placeholder="Alasan penolakan..."
            />
            <p className="text-[11px] mt-1.5 text-right" style={{ color: reason.length >= 10 ? "#10B981" : CLR_SUBTLE }}>
              {reason.length}/10 karakter minimum
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 text-white py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                style={{ background: GRAD_RED, fontFamily: FONT_DISPLAY }}
              >
                {actionLoading ? "Menyimpan..." : "Konfirmasi Tolak"}
              </button>
              <button
                onClick={() => { setRejectModal(null); setReason(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-[#F1F5F9]"
                style={{ border: `1px solid ${CLR_BORDER_LT}`, color: CLR_MUTED, fontFamily: FONT_DISPLAY }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}