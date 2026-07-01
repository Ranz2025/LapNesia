import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import { getReturns, updateReturnStatus } from "../../services/returnService";
import {
  RefreshCw, Package, ChevronRight, Clock, CheckCircle2,
  XCircle, AlertTriangle, Check, X
} from "lucide-react";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const GRADIENT = "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)";

const RETURN_STATUS = {
  pending:   { label: "Menunggu", bg: "rgba(245,158,11,0.12)", color: "#FBBF24", border: "rgba(245,158,11,0.3)", icon: <Clock size={12} /> },
  approved:  { label: "Disetujui", bg: "rgba(37,99,235,0.12)", color: "#60A5FA", border: "rgba(37,99,235,0.3)", icon: <CheckCircle2 size={12} /> },
  rejected:  { label: "Ditolak", bg: "rgba(239,68,68,0.12)", color: "#F87171", border: "rgba(239,68,68,0.3)", icon: <XCircle size={12} /> },
  completed: { label: "Selesai", bg: "rgba(34,197,94,0.12)", color: "#4ADE80", border: "rgba(34,197,94,0.3)", icon: <CheckCircle2 size={12} /> },
};

function StatusPill({ status }) {
  const cfg = RETURN_STATUS[status] || RETURN_STATUS.pending;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function ActionModal({ returnItem, onClose, onUpdated }) {
  const [status, setStatus] = useState("approved");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateReturnStatus(returnItem.id, status, notes);
      toast.success(`Pengembalian berhasil ${status === "approved" ? "disetujui" : "ditolak"}.`);
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memproses pengembalian.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}>
        <h2 className="text-lg font-bold mb-1" style={{ fontFamily: FONT_DISPLAY, color: "#0F172A" }}>
          Proses Pengembalian
        </h2>
        <p className="text-sm mb-4" style={{ color: "#64748B" }}>
          Pesanan: <span className="font-semibold text-[#0F172A]">{returnItem.order?.order_number}</span>
        </p>

        {/* Alasan pembeli */}
        <div className="p-3 rounded-xl mb-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#64748B" }}>Alasan Pembeli:</p>
          <p className="text-sm" style={{ color: "#334155" }}>{returnItem.reason}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pilih keputusan */}
          <div className="flex gap-3">
            <label
              className="flex-1 flex items-center gap-2 p-3 rounded-xl cursor-pointer transition"
              style={{
                background: status === "approved" ? "rgba(34,197,94,0.08)" : "#F8FAFC",
                border: status === "approved" ? "1px solid rgba(34,197,94,0.4)" : "1px solid #E2E8F0",
              }}
            >
              <input type="radio" name="status" value="approved" checked={status === "approved"} onChange={() => setStatus("approved")} className="accent-green-500" />
              <Check size={15} style={{ color: "#4ADE80" }} />
              <span className="text-sm font-medium" style={{ color: "#334155" }}>Setujui</span>
            </label>
            <label
              className="flex-1 flex items-center gap-2 p-3 rounded-xl cursor-pointer transition"
              style={{
                background: status === "rejected" ? "rgba(239,68,68,0.08)" : "#F8FAFC",
                border: status === "rejected" ? "1px solid rgba(239,68,68,0.4)" : "1px solid #E2E8F0",
              }}
            >
              <input type="radio" name="status" value="rejected" checked={status === "rejected"} onChange={() => setStatus("rejected")} className="accent-red-500" />
              <X size={15} style={{ color: "#F87171" }} />
              <span className="text-sm font-medium" style={{ color: "#334155" }}>Tolak</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0F172A" }}>
              Catatan untuk Pembeli <span style={{ color: "#94A3B8" }}>(opsional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={status === "rejected" ? "Jelaskan alasan penolakan..." : "Instruksi pengiriman barang kembali..."}
              className="w-full outline-none rounded-xl px-4 py-3 text-sm resize-none placeholder:text-[#94A3B8]"
              style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" }}
              onFocus={e => e.target.style.borderColor = "#2563EB"}
              onBlur={e => e.target.style.borderColor = "#E2E8F0"}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-full text-sm font-semibold text-[#0F172A] transition hover:brightness-110 disabled:opacity-60"
              style={{ background: GRADIENT, fontFamily: FONT_DISPLAY }}
            >
              {loading ? "Menyimpan..." : "Konfirmasi"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full text-sm font-semibold transition"
              style={{ background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0" }}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SellerReturns() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const fetchReturns = async () => {
    try {
      setLoading(true); setError(null);
      const res = await getReturns();
      const inner = res?.data;
      const list = Array.isArray(inner?.data) ? inner.data
                 : Array.isArray(inner) ? inner : [];
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

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2563EB" }} />
              <span className="text-[11px] tracking-widest uppercase" style={{ color: "#60A5FA" }}>Seller Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: FONT_DISPLAY }}>
              Permintaan Pengembalian
            </h1>
            <p className="text-sm mt-1" style={{ color: "#64748B" }}>Kelola permintaan pengembalian barang dari pembeli.</p>
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
            <p className="font-semibold" style={{ color: "#64748B" }}>Tidak ada permintaan pengembalian</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F1F5F9", borderBottom: "1px solid #BFDBFE" }}>
                  {["No. Pesanan", "Produk", "Pembeli", "Alasan", "Status", "Aksi"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.map((ret, idx) => (
                  <tr
                    key={ret.id}
                    style={{ background: idx % 2 === 0 ? "transparent" : "#F8FAFC", borderBottom: "1px solid #BFDBFE" }}
                  >
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "#475569" }}>
                      {ret.order?.order_number || "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "#0F172A", maxWidth: 140 }}>
                      <span className="block truncate">
                        {ret.order?.product?.model || ret.order?.product_snapshot?.model || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#475569" }}>
                      {ret.buyer?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#475569", maxWidth: 180 }}>
                      <span className="line-clamp-2">{ret.reason}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={ret.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => navigate(`/returns/${ret.id}`)}
                          className="text-xs font-semibold transition hover:brightness-110"
                          style={{ backgroundImage: GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                        >
                          Detail
                        </button>
                        {ret.status === "pending" && (
                          <button
                            onClick={() => setActionModal(ret)}
                            className="px-2.5 py-1 rounded-full text-xs font-semibold text-[#0F172A] transition hover:brightness-110"
                            style={{ background: GRADIENT }}
                          >
                            Proses
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {actionModal && (
        <ActionModal
          returnItem={actionModal}
          onClose={() => setActionModal(null)}
          onUpdated={fetchReturns}
        />
      )}
    </div>
  );
}
