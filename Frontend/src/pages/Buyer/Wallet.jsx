import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, TrendingUp, Lock, ArrowDownToLine, Sparkles,
  ArrowUpRight, ArrowDownLeft, RefreshCw, Receipt
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { CardSkeleton, TableSkeleton } from "../../components/ui/Skeleton";
import api from "../../services/api";

const FONT_DISPLAY  = "'Baloo 2', sans-serif";
const FONT_BODY     = "'Inter', sans-serif";
const GRAD_PRIMARY  = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG  = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";
const CLR_DANGER    = "#EF4444";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

const unwrapData = (payload) => {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return data?.data ?? data ?? [];
};

const TXN_TYPE_STYLE = {
  credit:        { color: "#059669", bg: "rgba(5,150,105,0.10)",  icon: ArrowDownLeft, sign: "+" },
  debit:         { color: "#DC2626", bg: "rgba(239,68,68,0.10)",  icon: ArrowUpRight,  sign: "-" },
  return_refund: { color: "#059669", bg: "rgba(5,150,105,0.10)",  icon: ArrowDownLeft, sign: "+" },
};

const TXN_STATUS_STYLE = {
  completed: { background: "rgba(5,150,105,0.10)", color: "#059669", border: "rgba(5,150,105,0.25)" },
  released:  { background: "rgba(5,150,105,0.10)", color: "#059669", border: "rgba(5,150,105,0.25)" },
  refunded:  { background: "rgba(5,150,105,0.10)", color: "#059669", border: "rgba(5,150,105,0.25)" },
  pending:   { background: "rgba(217,119,6,0.10)", color: "#D97706", border: "rgba(217,119,6,0.25)" },
};

const TXN_TYPE_LABEL = {
  return_refund: "Refund Return",
  credit:        "Kredit",
  debit:         "Debit",
};

function SectionLabel({ icon, text }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold"
      style={{ color: CLR_ACCENT, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)" }}
    >
      {icon} {text}
    </span>
  );
}

function WalletCard({ icon: Icon, label, value, sub, accent, accentBg, highlight }) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={
        highlight
          ? { background: "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)", border: `1.5px solid ${CLR_ACCENT}`, boxShadow: "0 8px 24px -8px rgba(37,99,235,0.25)" }
          : { background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }
      }
    >
      <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full pointer-events-none" style={{ background: accent, opacity: 0.08 }} />
      <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ background: accentBg }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: CLR_MUTED }}>{label}</p>
      <p
        className="text-2xl leading-none font-bold mb-1"
        style={{ fontFamily: FONT_DISPLAY, backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] font-medium" style={{ color: accent }}>{sub}</p>}
    </div>
  );
}

export default function BuyerWallet() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchWallet(); }, []);

  const fetchWallet = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const result = await api.get("/v1/wallet");
      setWallet(unwrapData(result) || {});
      const txnResult = await api.get("/v1/wallet/transactions");
      setTransactions(unwrapData(txnResult));
    } catch (err) {
      setError(err.message || "Gagal memuat wallet");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      <Navbar />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <main className={`${SECTION_X} py-8`}>

        {/* Hero header */}
        <div
          className="rounded-3xl overflow-hidden relative px-6 sm:px-10 py-7 sm:py-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          style={{ background: GRAD_HERO_BG, border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#06B6D4" }} />

          <div className="relative">
            <div className="mb-2">
              <SectionLabel icon={<Sparkles size={11} />} text="Buyer Dashboard" />
            </div>
            <h1 className="text-2xl sm:text-3xl leading-tight mb-1" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}>
              Dompet{" "}
              <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Saya
              </span>
            </h1>
            <p className="text-sm" style={{ color: CLR_MUTED }}>
              Kelola saldo dan pantau riwayat transaksi kamu.
            </p>
          </div>

          <div className="relative flex gap-2 flex-shrink-0">
            <button
              onClick={() => fetchWallet(true)}
              className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}`, color: CLR_MUTED }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = CLR_ACCENT)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = CLR_BORDER)}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Memperbarui..." : "Refresh"}
            </button>
            <button
              onClick={() => navigate("/withdrawal")}
              className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition hover:brightness-110 active:scale-95"
              style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY, boxShadow: "0 4px 16px rgba(37,99,235,0.30)" }}
            >
              <ArrowDownToLine size={15} /> Tarik Dana
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
            <TableSkeleton rows={5} cols={4} />
          </div>
        ) : error ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)" }}>
            <p className="mb-4 text-sm" style={{ color: CLR_DANGER }}>{error}</p>
            <button
              onClick={() => fetchWallet()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-110"
              style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY }}
            >
              Coba Lagi
            </button>
          </div>
        ) : wallet ? (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <WalletCard
                icon={Wallet} label="Saldo Tersedia"
                value={`Rp ${Number(wallet.available_balance || 0).toLocaleString("id-ID")}`}
                sub="Siap dicairkan"
                accent="#2563EB" accentBg="rgba(37,99,235,0.10)"
                highlight
              />
              <WalletCard
                icon={Lock} label="Saldo Ditahan"
                value={`Rp ${Number(wallet.held_balance || 0).toLocaleString("id-ID")}`}
                sub="Menunggu proses"
                accent="#D97706" accentBg="rgba(217,119,6,0.10)"
              />
              <WalletCard
                icon={TrendingUp} label="Total Saldo"
                value={`Rp ${Number(wallet.total_balance || 0).toLocaleString("id-ID")}`}
                sub="Tersedia + ditahan"
                accent="#059669" accentBg="rgba(5,150,105,0.10)"
              />
            </div>

            {/* Transaction history */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 12px rgba(37,99,235,0.06)" }}
            >
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}>
                <div>
                  <SectionLabel icon={<Receipt size={11} />} text="Mutasi" />
                  <h2 className="text-base mt-2.5" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
                    Riwayat Transaksi
                  </h2>
                </div>
                <span className="text-xs font-medium" style={{ color: CLR_SUBTLE }}>
                  {transactions.length} transaksi
                </span>
              </div>

              {!Array.isArray(transactions) || transactions.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <Receipt size={36} className="mx-auto mb-3" style={{ color: CLR_SUBTLE }} />
                  <p className="text-sm" style={{ color: CLR_MUTED }}>Belum ada transaksi.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead>
                      <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${CLR_BORDER_LT}` }}>
                        {["Tanggal", "Tipe", "Jumlah", "Status"].map((h) => (
                          <th key={h} className="text-left px-6 py-3.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color: CLR_MUTED }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn, idx) => {
                        const typeStyle = TXN_TYPE_STYLE[txn.type] || { color: CLR_MUTED, bg: "#F8FAFC", icon: Receipt, sign: "" };
                        const TypeIcon = typeStyle.icon;
                        const statusStyle = TXN_STATUS_STYLE[txn.status] || { background: "rgba(100,116,139,0.10)", color: CLR_MUTED, border: "rgba(100,116,139,0.20)" };
                        return (
                          <tr
                            key={txn.id}
                            style={{ background: idx % 2 === 0 ? "transparent" : "#F8FAFC", borderBottom: `1px solid ${CLR_BORDER_LT}` }}
                          >
                            <td className="px-6 py-3.5" style={{ color: CLR_MUTED }}>
                              {new Date(txn.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center gap-1.5 capitalize font-medium" style={{ color: CLR_TEXT }}>
                                <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: typeStyle.bg }}>
                                  <TypeIcon size={12} style={{ color: typeStyle.color }} />
                                </span>
                                {TXN_TYPE_LABEL[txn.type] || txn.type}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 font-semibold" style={{ color: typeStyle.color }}>
                              {typeStyle.sign} Rp {Number(txn.amount).toLocaleString("id-ID")}
                            </td>
                            <td className="px-6 py-3.5">
                              <span
                                className="px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
                                style={{ background: statusStyle.background, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
                              >
                                {txn.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)" }}>
            <p className="text-sm" style={{ color: CLR_DANGER }}>Gagal memuat wallet</p>
            <button
              onClick={() => fetchWallet()}
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-110"
              style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY }}
            >
              Coba Lagi
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
