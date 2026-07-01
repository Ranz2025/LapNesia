import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import { getReturn, submitReturnResi } from "../../services/returnService";
import { getUser } from "../../services/authService";
import {
  ArrowLeft, Package, RefreshCw, CheckCircle2, XCircle,
  Clock, Truck, AlertTriangle, User, CalendarDays
} from "lucide-react";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const GRADIENT = "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)";

const RETURN_STATUS = {
  pending:   { label: "Menunggu Keputusan Penjual", bg: "rgba(245,158,11,0.12)", color: "#FBBF24", border: "rgba(245,158,11,0.3)", icon: <Clock size={14} /> },
  approved:  { label: "Disetujui — Kirim Barang Kembali", bg: "rgba(37,99,235,0.12)", color: "#60A5FA", border: "rgba(37,99,235,0.3)", icon: <CheckCircle2 size={14} /> },
  rejected:  { label: "Ditolak", bg: "rgba(239,68,68,0.12)", color: "#F87171", border: "rgba(239,68,68,0.3)", icon: <XCircle size={14} /> },
  completed: { label: "Selesai", bg: "rgba(34,197,94,0.12)", color: "#4ADE80", border: "rgba(34,197,94,0.3)", icon: <CheckCircle2 size={14} /> },
};

function StatusPill({ status }) {
  const cfg = RETURN_STATUS[status] || RETURN_STATUS.pending;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}>
      {children}
    </div>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div className="flex justify-between items-start py-3" style={{ borderBottom: "1px solid #EFF6FF" }}>
      <span className="text-sm" style={{ color: "#64748B" }}>{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]" style={{ color: accent ? "#60A5FA" : "#334155" }}>{value}</span>
    </div>
  );
}

export default function ReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [returnData, setReturnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resi, setResi] = useState("");
  const [submittingResi, setSubmittingResi] = useState(false);

  const user = getUser();
  const isBuyer = user?.role === "buyer";

  const fetchReturn = async () => {
    try {
      setLoading(true);
      const res = await getReturn(id);
      setReturnData(res.data?.data ?? res.data ?? null);
    } catch {
      toast.error("Gagal memuat data pengembalian.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReturn(); }, [id]);

  const handleSubmitResi = async (e) => {
    e.preventDefault();
    if (!resi.trim()) { toast.error("Masukkan nomor resi."); return; }
    setSubmittingResi(true);
    try {
      await submitReturnResi(id, resi.trim());
      toast.success("Nomor resi pengembalian berhasil disimpan.");
      setResi("");
      fetchReturn();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan resi.");
    } finally {
      setSubmittingResi(false);
    }
  };

  const backPath = isBuyer ? "/returns" : "/seller/returns";

  if (loading) return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh" }}>
      <Navbar />
      <PageLoader />
    </div>
  );

  if (!returnData) return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertTriangle size={40} className="mx-auto mb-4" style={{ color: "#F87171" }} />
        <p style={{ color: "#64748B" }}>Data pengembalian tidak ditemukan.</p>
        <button onClick={() => navigate(backPath)} className="mt-4 underline text-sm" style={{ color: "#60A5FA" }}>
          Kembali
        </button>
      </div>
    </div>
  );

  const order = returnData.order;
  const productName = order?.product?.model || order?.product_snapshot?.model || "—";

  return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: "#64748B" }}
          onMouseEnter={e => e.currentTarget.style.color = "#2563EB"}
          onMouseLeave={e => e.currentTarget.style.color = "#64748B"}
        >
          <ArrowLeft size={15} /> Kembali
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: FONT_DISPLAY }}>
            Detail Pengembalian
          </h1>
        </div>

        <div className="space-y-4">
          {/* Status card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <StatusPill status={returnData.status} />
            </div>
            {/* Info produk */}
            <div className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)" }}>
                <Package size={15} style={{ color: "#2563EB" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>{productName}</p>
                <p className="text-xs" style={{ color: "#64748B" }}>{order?.order_number}</p>
              </div>
            </div>
            <InfoRow label="Pembeli" value={returnData.buyer?.name || "—"} />
            <InfoRow label="Penjual" value={returnData.seller?.name || "—"} />
            <InfoRow
              label="Tanggal Pengajuan"
              value={new Date(returnData.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            />
            {returnData.return_resi && (
              <InfoRow label="No. Resi Pengembalian" value={returnData.return_resi} accent />
            )}
          </Card>

          {/* Alasan */}
          <Card>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "#64748B" }}>ALASAN PENGEMBALIAN</h3>
            <p className="text-sm" style={{ color: "#334155" }}>{returnData.reason}</p>
          </Card>

          {/* Catatan penjual */}
          {returnData.seller_notes && (
            <Card>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "#64748B" }}>CATATAN PENJUAL</h3>
              <p className="text-sm" style={{ color: "#334155" }}>{returnData.seller_notes}</p>
            </Card>
          )}

          {/* Catatan admin */}
          {returnData.admin_notes && (
            <Card>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "#64748B" }}>CATATAN ADMIN</h3>
              <p className="text-sm" style={{ color: "#334155" }}>{returnData.admin_notes}</p>
            </Card>
          )}

          {/* Buyer: input resi jika approved dan belum ada resi */}
          {isBuyer && returnData.status === "approved" && !returnData.return_resi && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Truck size={16} style={{ color: "#2563EB" }} />
                <h3 className="text-sm font-semibold" style={{ color: "#0F172A" }}>
                  Kirim Barang & Input Nomor Resi
                </h3>
              </div>
              <p className="text-sm mb-4" style={{ color: "#64748B" }}>
                Pengembalian telah disetujui. Kirimkan barang ke alamat penjual dan masukkan nomor resi di bawah.
              </p>
              <form onSubmit={handleSubmitResi} className="flex gap-3">
                <input
                  type="text"
                  value={resi}
                  onChange={(e) => setResi(e.target.value)}
                  placeholder="Contoh: JNE1234567890"
                  className="flex-1 outline-none rounded-xl px-4 py-2.5 text-sm placeholder:text-[#94A3B8]"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" }}
                  onFocus={e => e.target.style.borderColor = "#2563EB"}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
                <button
                  type="submit"
                  disabled={submittingResi}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#0F172A] transition hover:brightness-110 disabled:opacity-60"
                  style={{ background: GRADIENT, fontFamily: FONT_DISPLAY }}
                >
                  {submittingResi ? "..." : "Simpan"}
                </button>
              </form>
            </Card>
          )}

          {/* Resi sudah diinput */}
          {isBuyer && returnData.status === "approved" && returnData.return_resi && (
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)" }}>
              <Truck size={16} style={{ color: "#60A5FA" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>Resi Sudah Diinput</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                  No. Resi: <span className="font-mono font-semibold">{returnData.return_resi}</span>
                </p>
              </div>
            </div>
          )}

          {/* Ditolak */}
          {returnData.status === "rejected" && (
            <div className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <XCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#F87171" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#F87171" }}>Pengembalian Ditolak</p>
                {returnData.seller_notes && (
                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{returnData.seller_notes}</p>
                )}
              </div>
            </div>
          )}

          {/* Selesai */}
          {returnData.status === "completed" && (
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
              <p className="text-sm font-semibold" style={{ color: "#4ADE80" }}>Pengembalian Selesai</p>
            </div>
          )}

          {/* Link ke detail pesanan */}
          {order?.id && (
            <button
              onClick={() => navigate(`/orders/${order.id}`)}
              className="w-full py-3 rounded-full text-sm font-semibold transition hover:brightness-95 flex items-center justify-center gap-2"
              style={{ background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0" }}
            >
              Lihat Detail Pesanan
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
