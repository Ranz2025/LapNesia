import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import { getReturns } from "../../services/returnService";
import { RefreshCw, Package, ChevronRight, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const GRADIENT = "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)";

const RETURN_STATUS = {
  pending: {
    label: "Menunggu Keputusan",
    bg: "rgba(245,158,11,0.12)", color: "#FBBF24", border: "rgba(245,158,11,0.3)",
    icon: <Clock size={12} />,
  },
  approved: {
    label: "Disetujui",
    bg: "rgba(37,99,235,0.12)", color: "#60A5FA", border: "rgba(37,99,235,0.3)",
    icon: <CheckCircle2 size={12} />,
  },
  rejected: {
    label: "Ditolak",
    bg: "rgba(239,68,68,0.12)", color: "#F87171", border: "rgba(239,68,68,0.3)",
    icon: <XCircle size={12} />,
  },
  completed: {
    label: "Selesai",
    bg: "rgba(34,197,94,0.12)", color: "#4ADE80", border: "rgba(34,197,94,0.3)",
    icon: <CheckCircle2 size={12} />,
  },
};

function StatusPill({ status }) {
  const cfg = RETURN_STATUS[status] || RETURN_STATUS.pending;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function ReturnList() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReturns = async () => {
    try {
      setLoading(true); setError(null);
      const res = await getReturns();
      const root = res?.data?.data ?? res?.data ?? res;
      const list = Array.isArray(root) ? root : [];
      setReturns(list);
    } catch {
      setError("Gagal memuat daftar pengembalian.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReturns(); }, []);

  if (loading) return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh" }}>
      <Navbar />
      <PageLoader />
    </div>
  );

  return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2563EB" }} />
              <span className="text-[11px] tracking-widest uppercase" style={{ color: "#60A5FA" }}>Buyer</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: FONT_DISPLAY }}>
              Pengembalian Barang
            </h1>
            <p className="text-sm mt-1" style={{ color: "#64748B" }}>Pantau status pengajuan pengembalian Anda.</p>
          </div>
          <button
            onClick={fetchReturns}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition"
            style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#475569" }}
            onMouseEnter={e => e.currentTarget.style.background = "#E2E8F0"}
            onMouseLeave={e => e.currentTarget.style.background = "#F1F5F9"}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertTriangle className="mx-auto mb-3" size={32} style={{ color: "#F87171" }} />
            <p className="text-sm mb-4" style={{ color: "#F87171" }}>{error}</p>
            <button onClick={fetchReturns} className="text-sm underline" style={{ color: "#60A5FA" }}>Coba Lagi</button>
          </div>
        ) : returns.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}>
            <Package size={40} className="mx-auto mb-3" style={{ color: "#CBD5E1" }} />
            <p className="font-semibold mb-1" style={{ color: "#64748B" }}>Belum ada pengembalian</p>
            <p className="text-sm" style={{ color: "#94A3B8" }}>Pengembalian dapat diajukan dari halaman detail pesanan yang sudah selesai.</p>
            <button
              onClick={() => navigate("/orders")}
              className="mt-4 px-5 py-2.5 rounded-full text-sm font-semibold text-[#0F172A] transition hover:brightness-110"
              style={{ background: GRADIENT, fontFamily: FONT_DISPLAY }}
            >
              Lihat Pesanan Saya
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {returns.map((ret) => (
              <div
                key={ret.id}
                className="rounded-2xl p-5 cursor-pointer transition hover:shadow-sm"
                style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}
                onClick={() => navigate(`/returns/${ret.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)" }}
                    >
                      <Package size={16} style={{ color: "#2563EB" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#0F172A" }}>
                        {ret.order?.product?.model || ret.order?.product_snapshot?.model || "—"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                        {ret.order?.order_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusPill status={ret.status} />
                    <ChevronRight size={15} style={{ color: "#CBD5E1" }} />
                  </div>
                </div>

                <div className="mt-3 pl-13">
                  <p className="text-sm line-clamp-2 ml-13" style={{ color: "#475569", marginLeft: "52px" }}>
                    {ret.reason}
                  </p>
                  {ret.seller_notes && (
                    <p className="text-xs mt-1.5 italic" style={{ color: "#94A3B8", marginLeft: "52px" }}>
                      Catatan Penjual: {ret.seller_notes}
                    </p>
                  )}
                  <p className="text-xs mt-1.5" style={{ color: "#94A3B8", marginLeft: "52px" }}>
                    Diajukan {new Date(ret.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
