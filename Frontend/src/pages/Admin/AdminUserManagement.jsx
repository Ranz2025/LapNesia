import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Search, RefreshCw, ArrowLeft, ShieldOff, ShieldCheck,
  Sparkles, ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { toast } from "../../components/ui/Toast";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { getAllUsers, suspendUser, activateUser } from "../../services/adminService";

/* ─── DESIGN TOKENS ──────────────────────────────────────────── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_GREEN   = "linear-gradient(135deg, #34D399 0%, #059669 100%)";
const GRAD_RED     = "linear-gradient(135deg, #F87171 0%, #DC2626 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#64748B";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

const ROLE_FILTERS = [
  { key: "",           label: "Semua" },
  { key: "buyer",      label: "Pembeli" },
  { key: "seller",     label: "Penjual" },
  { key: "technician", label: "Teknisi" },
];

const STATUS_STYLE = {
  active:    { bg: "rgba(16,185,129,0.10)",  fg: "#059669", label: "Aktif" },
  verified:  { bg: "rgba(37,99,235,0.10)",   fg: "#2563EB", label: "Terverifikasi" },
  pending:   { bg: "rgba(202,138,4,0.10)",   fg: "#CA8A04", label: "Menunggu" },
  suspended: { bg: "rgba(220,38,38,0.10)",   fg: "#DC2626", label: "Ditangguhkan" },
  rejected:  { bg: "rgba(100,116,139,0.10)", fg: "#64748B", label: "Ditolak" },
};

const ROLE_STYLE = {
  buyer:      { bg: "rgba(8,145,178,0.10)",  fg: "#0891B2",  label: "Pembeli" },
  seller:     { bg: "rgba(147,51,234,0.10)", fg: "#9333EA",  label: "Penjual" },
  technician: { bg: "rgba(245,158,11,0.10)", fg: "#D97706",  label: "Teknisi" },
  admin:      { bg: "rgba(37,99,235,0.10)",  fg: "#2563EB",  label: "Admin" },
  owner:      { bg: "rgba(220,38,38,0.10)",  fg: "#DC2626",  label: "Owner" },
};

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
const initialsOf = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

/* ─── CONFIRM MODAL ──────────────────────────────────────────── */
function ConfirmModal({ user, action, onConfirm, onCancel, loading }) {
  const isSuspend = action === "suspend";
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
      <div
        className="rounded-2xl p-6 w-full max-w-md relative overflow-hidden"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 60px -16px rgba(0,0,0,0.35)", fontFamily: FONT_BODY }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: isSuspend ? GRAD_RED : GRAD_GREEN }} />

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isSuspend ? "rgba(220,38,38,0.10)" : "rgba(16,185,129,0.10)" }}
          >
            {isSuspend
              ? <ShieldOff size={20} style={{ color: "#DC2626" }} />
              : <ShieldCheck size={20} style={{ color: "#059669" }} />}
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
              {isSuspend ? "Tangguhkan Pengguna" : "Aktifkan Pengguna"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: CLR_SUBTLE }}>
              {user?.name} &middot; {user?.email}
            </p>
          </div>
        </div>

        <p className="text-sm mb-4" style={{ color: CLR_MUTED }}>
          {isSuspend
            ? "Pengguna tidak akan dapat login atau menggunakan platform selama ditangguhkan."
            : "Pengguna akan dapat kembali menggunakan platform."}
        </p>

        {isSuspend && (
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: CLR_MUTED }}>
              Alasan penangguhan <span style={{ color: CLR_SUBTLE }}>(opsional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Masukkan alasan..."
              className="w-full rounded-xl p-3 text-sm outline-none resize-none transition"
              style={{ background: "#F8FAFC", border: `1px solid ${CLR_BORDER_LT}`, color: CLR_TEXT }}
              onFocus={(e) => (e.target.style.borderColor = "#DC2626")}
              onBlur={(e) => (e.target.style.borderColor = CLR_BORDER_LT)}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 text-white py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-110 active:scale-95 disabled:opacity-60"
            style={{ background: isSuspend ? GRAD_RED : GRAD_GREEN, fontFamily: FONT_DISPLAY }}
          >
            {loading ? "Memproses..." : isSuspend ? "Tangguhkan" : "Aktifkan"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-[#F1F5F9] disabled:opacity-60"
            style={{ border: `1px solid ${CLR_BORDER_LT}`, color: CLR_MUTED, fontFamily: FONT_DISPLAY }}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function AdminUserManagement() {
  const navigate = useNavigate();

  const [users,       setUsers]       = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [lastPage,    setLastPage]    = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [roleFilter,  setRoleFilter]  = useState("");
  const [search,      setSearch]      = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modal,       setModal]       = useState(null); // { user, action }
  const [actionLoading, setActionLoading] = useState(false);

  const debounceRef = useRef(null);

  /* ── Fetch ── */
  const load = useCallback(async (p = 1, role = roleFilter, q = search) => {
    setLoading(true);
    try {
      const params = { page: p, ...(role && { role }), ...(q && { search: q }) };
      const res = await getAllUsers(params);
      const payload = res?.data;
      setUsers(payload?.data || []);
      setTotal(payload?.total || 0);
      setLastPage(payload?.last_page || 1);
      setPage(p);
    } catch {
      toast.error("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => { load(1, roleFilter, search); }, [roleFilter]);

  /* Search debounce 400ms */
  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      load(1, roleFilter, val);
    }, 400);
  };

  /* ── Suspend / Activate ── */
  const handleAction = async (reason = "") => {
    if (!modal) return;
    setActionLoading(true);
    try {
      if (modal.action === "suspend") {
        await suspendUser(modal.user.id, reason);
        toast.success(`${modal.user.name} berhasil ditangguhkan.`);
      } else {
        await activateUser(modal.user.id);
        toast.success(`${modal.user.name} berhasil diaktifkan kembali.`);
      }
      setModal(null);
      load(page, roleFilter, search);
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal memproses permintaan.");
    } finally {
      setActionLoading(false);
    }
  };

  const canSuspend = (user) =>
    !["admin", "owner"].includes(user.role) && user.status !== "suspended";

  const canActivate = (user) => user.status === "suspended";

  return (
    <div style={{ fontFamily: FONT_BODY }} className="relative min-h-screen overflow-hidden">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#F8FAFC" }}>
        <div className="absolute -top-32 -right-16 w-[420px] h-[420px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[360px] h-[360px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <Navbar />

      <main className={`${SECTION_X} py-8`}>

        {/* ══ HERO HEADER ══ */}
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
                <Sparkles size={11} /> Panel Admin
              </span>
              <h1 className="text-2xl md:text-3xl mb-1.5 text-white" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }}>
                Kelola Pengguna
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                {total > 0 ? `${total} pengguna terdaftar di platform LapNesia.` : "Kelola semua pengguna platform LapNesia."}
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:brightness-105 active:scale-95"
                style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.30)", fontFamily: FONT_DISPLAY }}
              >
                <ArrowLeft size={15} /> Dashboard
              </button>
              <button
                onClick={() => load(page)}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                style={{ background: "#FFFFFF", color: CLR_ACCENT, fontFamily: FONT_DISPLAY }}
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ══ SEARCH + FILTER ══ */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search bar */}
          <div
            className="relative flex-1"
            style={{ maxWidth: 400 }}
          >
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: CLR_SUBTLE }} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition"
              style={{
                background: "#FFFFFF",
                border: `1.5px solid ${CLR_BORDER_LT}`,
                color: CLR_TEXT,
                fontFamily: FONT_BODY,
              }}
              onFocus={(e) => (e.target.style.borderColor = CLR_ACCENT)}
              onBlur={(e) => (e.target.style.borderColor = CLR_BORDER_LT)}
            />
          </div>

          {/* Role filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} style={{ color: CLR_SUBTLE }} />
            {ROLE_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className="px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap"
                style={
                  roleFilter === key
                    ? { background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY, boxShadow: "0 4px 12px -4px rgba(37,99,235,0.5)" }
                    : { background: "#FFFFFF", color: CLR_MUTED, border: `1px solid ${CLR_BORDER_LT}` }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ TABLE ══ */}
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : users.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(37,99,235,0.08)" }}>
              <Users size={24} style={{ color: CLR_ACCENT }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: CLR_MUTED }}>Tidak ada pengguna ditemukan.</p>
            <p className="text-xs" style={{ color: CLR_SUBTLE }}>
              {search ? `Tidak ada hasil untuk "${search}"` : "Coba ubah filter atau kata kunci pencarian."}
            </p>
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
                    {["Pengguna", "Kontak", "Role", "Status", "Bergabung", "Aksi"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wide whitespace-nowrap"
                        style={{ color: CLR_SUBTLE }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => {
                    const statusStyle = STATUS_STYLE[user.status] || STATUS_STYLE.pending;
                    const roleStyle   = ROLE_STYLE[user.role]   || { bg: "rgba(100,116,139,0.10)", fg: "#64748B", label: user.role };
                    const isLast      = idx === users.length - 1;

                    return (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-[#F8FAFC]"
                        style={{ borderBottom: isLast ? "none" : `1px solid ${CLR_BORDER_LT}` }}
                      >
                        {/* Pengguna */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {user.profile_photo_url ? (
                              <img
                                src={user.profile_photo_url}
                                alt={user.name}
                                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ background: avatarGradFor(user.name || String(user.id)) }}
                              >
                                {initialsOf(user.name)}
                              </div>
                            )}
                            <span className="font-semibold whitespace-nowrap" style={{ color: CLR_TEXT }}>
                              {user.name}
                            </span>
                          </div>
                        </td>

                        {/* Kontak */}
                        <td className="px-5 py-4">
                          <p style={{ color: CLR_MUTED }}>{user.email}</p>
                          {user.phone && (
                            <p className="text-xs mt-0.5" style={{ color: CLR_SUBTLE }}>{user.phone}</p>
                          )}
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: roleStyle.bg, color: roleStyle.fg }}
                          >
                            {roleStyle.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: statusStyle.bg, color: statusStyle.fg }}
                          >
                            {statusStyle.label}
                          </span>
                        </td>

                        {/* Bergabung */}
                        <td className="px-5 py-4 whitespace-nowrap" style={{ color: CLR_SUBTLE, fontSize: 12 }}>
                          {new Date(user.created_at).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>

                        {/* Aksi */}
                        <td className="px-5 py-4">
                          <div className="flex gap-2 flex-wrap">
                            {canSuspend(user) && (
                              <button
                                onClick={() => setModal({ user, action: "suspend" })}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:brightness-95"
                                style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}
                              >
                                <ShieldOff size={13} /> Tangguhkan
                              </button>
                            )}
                            {canActivate(user) && (
                              <button
                                onClick={() => setModal({ user, action: "activate" })}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:brightness-95"
                                style={{ background: "rgba(16,185,129,0.10)", color: "#059669" }}
                              >
                                <ShieldCheck size={13} /> Aktifkan
                              </button>
                            )}
                            {["admin", "owner"].includes(user.role) && (
                              <span className="text-xs italic" style={{ color: CLR_SUBTLE }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {lastPage > 1 && (
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}
              >
                <p className="text-xs" style={{ color: CLR_SUBTLE }}>
                  Halaman {page} dari {lastPage} &middot; {total} pengguna
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => load(page - 1)}
                    disabled={page <= 1 || loading}
                    className="flex items-center justify-center w-8 h-8 rounded-lg transition hover:bg-[#F1F5F9] disabled:opacity-40"
                    style={{ border: `1px solid ${CLR_BORDER_LT}`, color: CLR_MUTED }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
                    const p = page <= 3 ? i + 1 : page - 2 + i;
                    if (p < 1 || p > lastPage) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => load(p)}
                        className="w-8 h-8 rounded-lg text-xs font-semibold transition"
                        style={
                          p === page
                            ? { background: GRAD_PRIMARY, color: "#fff" }
                            : { border: `1px solid ${CLR_BORDER_LT}`, color: CLR_MUTED }
                        }
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => load(page + 1)}
                    disabled={page >= lastPage || loading}
                    className="flex items-center justify-center w-8 h-8 rounded-lg transition hover:bg-[#F1F5F9] disabled:opacity-40"
                    style={{ border: `1px solid ${CLR_BORDER_LT}`, color: CLR_MUTED }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Confirm Modal ── */}
      {modal && (
        <ConfirmModal
          user={modal.user}
          action={modal.action}
          onConfirm={handleAction}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
