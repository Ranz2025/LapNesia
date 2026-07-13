import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, RefreshCw, Check, ExternalLink, CheckCheck,
  ShoppingBag, Wallet, Truck, PackageCheck, RotateCcw,
  ClipboardCheck, Wrench, CreditCard,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import { getNotifications, markAsRead, markAllAsRead } from "../../services/notificationService";

/* ─── Design Tokens ─── */
const FONT_DISPLAY  = "'Baloo 2', sans-serif";
const FONT_BODY     = "'Inter', sans-serif";
const GRAD_PRIMARY  = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#64748B";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const TYPE_META = {
  order_created:              { icon: <ShoppingBag size={16} />,    grad: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" },
  order_paid_seller:          { icon: <CreditCard size={16} />,     grad: "linear-gradient(135deg, #34D399 0%, #059669 100%)" },
  payment_success:            { icon: <CreditCard size={16} />,     grad: "linear-gradient(135deg, #34D399 0%, #059669 100%)" },
  order_shipped:              { icon: <Truck size={16} />,          grad: "linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)" },
  order_completed:            { icon: <PackageCheck size={16} />,   grad: "linear-gradient(135deg, #34D399 0%, #059669 100%)" },
  return_requested:           { icon: <RotateCcw size={16} />,      grad: "linear-gradient(135deg, #FB923C 0%, #EA580C 100%)" },
  return_status_updated:      { icon: <RotateCcw size={16} />,      grad: "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)" },
  inspection_completed:       { icon: <ClipboardCheck size={16} />, grad: "linear-gradient(135deg, #C084FC 0%, #9333EA 100%)" },
  inspection_report_pub:      { icon: <ClipboardCheck size={16} />, grad: "linear-gradient(135deg, #C084FC 0%, #9333EA 100%)" },
  inspection_job_accepted:    { icon: <ClipboardCheck size={16} />, grad: "linear-gradient(135deg, #34D399 0%, #059669 100%)" },
  inspection_job_rejected:    { icon: <ClipboardCheck size={16} />, grad: "linear-gradient(135deg, #F87171 0%, #DC2626 100%)" },
  inspection_scheduled:       { icon: <ClipboardCheck size={16} />, grad: "linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)" },
  inspection_in_progress:     { icon: <Wrench size={16} />,         grad: "linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)" },
  inspection_report_uploaded: { icon: <ClipboardCheck size={16} />, grad: "linear-gradient(135deg, #C084FC 0%, #9333EA 100%)" },
  inspection_job_created:     { icon: <Wrench size={16} />,         grad: "linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)" },
  withdrawal_approved:        { icon: <Wallet size={16} />,         grad: "linear-gradient(135deg, #34D399 0%, #059669 100%)" },
  withdrawal_rejected:        { icon: <Wallet size={16} />,         grad: "linear-gradient(135deg, #F87171 0%, #DC2626 100%)" },
  technician_verified:        { icon: <Wrench size={16} />,         grad: "linear-gradient(135deg, #34D399 0%, #059669 100%)" },
};
const DEFAULT_META = { icon: <Bell size={16} />, grad: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" };
const metaOf = (type) => TYPE_META[type] || DEFAULT_META;

function groupLabel(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const startOf = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (diffDays <= 0) return "Hari Ini";
  if (diffDays === 1) return "Kemarin";
  return "Lebih Lama";
}

export default function BuyerNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [unreadCount, setUnreadCount]     = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getNotifications();
      const inner  = result?.data;
      const notifs = Array.isArray(inner?.data) ? inner.data
                   : Array.isArray(inner) ? inner
                   : [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read_at).length);
    } catch {
      setError("Gagal memuat notifikasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      // Beritahu Navbar agar badge langsung berkurang
      window.dispatchEvent(new CustomEvent("notif:read", { detail: { markAll: false } }));
    } catch {
      toast.error("Gagal menandai notifikasi.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success("Semua notifikasi ditandai dibaca.");
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnreadCount(0);
      // Beritahu Navbar agar badge langsung hilang
      window.dispatchEvent(new CustomEvent("notif:read", { detail: { markAll: true } }));
    } catch {
      toast.error("Gagal menandai semua sebagai dibaca.");
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read_at) await handleMarkRead(notif.id);
    const url = notif.data?.action_url;
    if (url) navigate(url);
  };

  const AmbientBg = () => (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#F8FAFC" }}>
      <div className="absolute -top-32 -right-16 w-[420px] h-[420px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
      <div className="absolute top-[55%] -left-20 w-[360px] h-[360px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
    </div>
  );

  if (loading) return (
    <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT_BODY }}>
      <AmbientBg /><Navbar /><PageLoader />
    </div>
  );

  /* Group by date */
  const groups = [];
  let lastLabel = null;
  notifications.forEach((n) => {
    const label = groupLabel(n.created_at);
    if (label !== lastLabel) { groups.push({ label, items: [] }); lastLabel = label; }
    groups[groups.length - 1].items.push(n);
  });

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT_BODY }}>
      <AmbientBg />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Hero Header */}
        <div
          className="relative rounded-3xl overflow-hidden mb-7 px-6 sm:px-8 py-7"
          style={{ background: GRAD_PRIMARY, boxShadow: "0 16px 40px -16px rgba(37,99,235,0.45)" }}
        >
          <div className="absolute -top-14 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />
          <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative" style={{ background: "rgba(255,255,255,0.18)" }}>
                <Bell size={20} className="text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full" style={{ background: "#FB923C", border: "2px solid #1D4ED8" }} />
                )}
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Buyer Dashboard
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight" style={{ fontFamily: FONT_DISPLAY }}>
                  Notifikasi
                </h1>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-105 active:scale-95"
                  style={{ background: "#FFFFFF", color: CLR_ACCENT, fontFamily: FONT_DISPLAY }}
                >
                  <CheckCheck size={15} /> Tandai Semua
                </button>
              )}
              <button
                onClick={fetchNotifications}
                className="flex items-center justify-center w-10 h-10 rounded-xl transition flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                <RefreshCw size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)" }}>
            <p className="text-sm mb-4 font-medium" style={{ color: "#DC2626" }}>{error}</p>
            <button onClick={fetchNotifications} className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}>
              Coba Lagi
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}` }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(37,99,235,0.08)" }}>
              <Bell className="w-7 h-7" style={{ color: CLR_ACCENT }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>Tidak ada notifikasi</p>
            <p className="text-sm" style={{ color: CLR_SUBTLE }}>Notifikasi akan muncul saat ada pesanan, pembayaran, atau aktivitas baru.</p>
          </div>
        ) : (
          <div className="space-y-7">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3 px-1" style={{ color: CLR_SUBTLE }}>
                  {group.label}
                </p>
                <div className="space-y-2.5">
                  {group.items.map((notif) => {
                    const meta      = metaOf(notif.data?.type);
                    const hasAction = !!notif.data?.action_url;
                    const isUnread  = !notif.read_at;

                    return (
                      <div
                        key={notif.id}
                        className="rounded-2xl p-4 sm:p-5 flex gap-3.5 transition-all duration-200"
                        style={{
                          background:  isUnread ? "linear-gradient(160deg, #EFF6FF 0%, #FFFFFF 100%)" : "#FFFFFF",
                          border:      isUnread ? `1px solid ${CLR_BORDER}` : `1px solid ${CLR_BORDER_LT}`,
                          boxShadow:   isUnread ? "0 4px 14px -6px rgba(37,99,235,0.18)" : "0 1px 4px rgba(0,0,0,0.03)",
                          cursor:      hasAction ? "pointer" : "default",
                        }}
                        onClick={hasAction ? () => handleNotifClick(notif) : undefined}
                        onMouseEnter={(e) => { if (hasAction) e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        {/* Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                          style={{ background: meta.grad, boxShadow: "0 4px 10px rgba(37,99,235,0.20)" }}
                        >
                          {meta.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm flex items-center gap-1.5" style={{ color: CLR_TEXT }}>
                              {notif.data?.title || "Notifikasi"}
                              {isUnread && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: CLR_ACCENT }} />}
                            </h3>
                            {hasAction && <ExternalLink size={13} className="flex-shrink-0 mt-0.5" style={{ color: CLR_SUBTLE }} />}
                          </div>
                          <p className="text-sm mt-0.5" style={{ color: CLR_MUTED }}>
                            {notif.data?.message}
                          </p>
                          <p className="text-xs mt-2" style={{ color: "#94A3B8" }}>
                            {new Date(notif.created_at).toLocaleString("id-ID", {
                              day: "numeric", month: "long", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Tombol tandai dibaca */}
                        {isUnread && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition hover:brightness-95 self-start"
                            style={{ background: "rgba(37,99,235,0.10)", color: CLR_ACCENT }}
                            title="Tandai sudah dibaca"
                          >
                            <Check size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
