import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingDown, TrendingUp, RefreshCw } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { CardSkeleton, TableSkeleton } from "../../components/ui/Skeleton";
import api from "../../services/api";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const GRADIENT = "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)";

export default function BuyerWallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [walletRes, txRes] = await Promise.allSettled([
        api.get("/v1/wallet"),
        api.get("/v1/wallet/transactions"),
      ]);
      if (walletRes.status === "fulfilled") {
        const payload = walletRes.value.data?.data;
        setWallet(Array.isArray(payload?.data) ? payload.data : payload?.data ?? payload ?? null);
      }
      const txData = txRes.status === "fulfilled" ? txRes.value.data?.data : null;
      setTransactions(Array.isArray(txData?.data) ? txData.data : Array.isArray(txData) ? txData : (txData?.data || []));
    } catch {
      setError("Gagal memuat data wallet.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#F0F9FF", minHeight: "100vh" }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
          <TableSkeleton rows={5} cols={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <p className="mb-4 text-sm" style={{ color: "#F87171" }}>{error}</p>
            <button onClick={fetchAll} className="flex items-center gap-2 mx-auto text-sm" style={{ color: "#60A5FA" }}>
              <RefreshCw size={16} /> Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const balanceCards = wallet ? [
    {
      label: "Saldo Tersedia",
      value: wallet.available_balance || 0,
      icon: <Wallet size={22} />,
      accent: "#2563EB",
      accentBg: "rgba(37,99,235,0.15)",
    },
    {
      label: "Saldo Terbekukan",
      value: wallet.frozen_balance || 0,
      icon: <TrendingDown size={22} />,
      accent: "#FBBF24",
      accentBg: "rgba(245,158,11,0.15)",
    },
    {
      label: "Saldo Tertahan",
      value: wallet.held_balance || 0,
      icon: <TrendingUp size={22} />,
      accent: "#34D399",
      accentBg: "rgba(16,185,129,0.15)",
    },
  ] : [];

  return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]" style={{ fontFamily: FONT_DISPLAY }}>
            Dompet Saya
          </h1>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition hover:brightness-110"
            style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#475569" }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {wallet && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {balanceCards.map(({ label, value, icon, accent, accentBg }) => (
              <div
                key={label}
                className="rounded-2xl p-6"
                style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm" style={{ color: "#475569" }}>{label}</p>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: accentBg, color: accent }}
                  >
                    {icon}
                  </div>
                </div>
                <p
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ fontFamily: FONT_DISPLAY, color: accent }}
                >
                  Rp {value.toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Transaction table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}
        >
          <div className="p-6" style={{ borderBottom: "1px solid #BFDBFE" }}>
            <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: FONT_DISPLAY }}>Riwayat Transaksi</h2>
          </div>

          {!Array.isArray(transactions) || transactions.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingDown className="w-12 h-12 mx-auto mb-3" style={{ color: "#4B4B66" }} />
              <p style={{ color: "#64748B" }}>Belum ada transaksi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: "#F1F5F9" }}>
                  <tr>
                    {["Tanggal", "Tipe", "Jumlah", "Keterangan"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 sm:px-6 py-3 font-semibold text-left ${i === 2 ? "text-right" : ""} ${i === 3 ? "hidden sm:table-cell" : ""}`}
                        style={{ color: "#475569", borderBottom: "1px solid #BFDBFE" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      style={{ borderBottom: "1px solid #BFDBFE" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FFFFFF"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td className="px-4 sm:px-6 py-3" style={{ color: "#475569" }}>
                        {new Date(tx.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                          style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA" }}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right font-semibold">
                        <span style={{ color: tx.type === "credit" ? "#34D399" : "#F87171" }}>
                          {tx.type === "credit" ? "+" : "-"} Rp {Number(tx.amount || 0).toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 hidden sm:table-cell" style={{ color: "#64748B" }}>
                        {tx.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
