/**
 * RevenueDetailModal.jsx
 * Modal detail pendapatan platform.
 * Muncul saat titik di grafik diklik.
 * `data` bisa berupa:
 *   - Object satu titik: { date, label, revenue, orders }
 *   - Array titik (legacy): [{ date, revenue, orders }, ...]
 */
import { X, TrendingUp, ShoppingCart, Calendar } from "lucide-react";

const fmtCurrency = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);

/* ─── Badge status order ─── */
function StatBox({ icon, label, value, color = "#22D3EE", bg = "rgba(6,182,212,0.10)", border = "rgba(6,182,212,0.20)" }) {
  return (
    <div style={{
      flex: 1, borderRadius: 12, padding: "14px 16px",
      background: bg, border: `1px solid ${border}`,
    }}>
      <p style={{
        fontSize: 10, color: "#475569", margin: "0 0 7px 0",
        textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600,
      }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ color }}>{icon}</span>
        <p style={{
          fontSize: 17, fontWeight: 800, color, margin: 0,
          fontFamily: "'Baloo 2', sans-serif",
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function RevenueDetailModal({ isOpen, data, onClose }) {
  if (!isOpen || !data) return null;

  const isArray = Array.isArray(data);

  /* ── Kalkulasi nilai ── */
  let dateLabel   = "";
  let totalRev    = 0;
  let totalOrders = 0;
  let items       = [];

  if (isArray) {
    items       = data.filter((d) => Number(d.revenue) > 0);
    totalRev    = items.reduce((s, d) => s + Number(d.revenue), 0);
    totalOrders = items.reduce((s, d) => s + Number(d.orders ?? 0), 0);
    dateLabel   = "Rincian periode ini";
    if (items.length === 0) return null;
  } else {
    totalRev    = Number(data.revenue ?? 0);
    totalOrders = Number(data.orders  ?? 0);
    dateLabel   = data.date ?? data.label ?? "";
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.60)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
        animation: "bdFadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(160deg, #0B1220 0%, #0D1828 100%)",
          border: "1px solid rgba(6,182,212,0.18)",
          borderRadius: 20,
          boxShadow:
            "0 30px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)",
          maxWidth: 420,
          width: "100%",
          overflow: "hidden",
          animation: "modalSlideUp 0.25s cubic-bezier(.16,.68,.35,1.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <TrendingUp size={17} color="#22D3EE" />
            </div>
            <div>
              <h2 style={{
                fontSize: 15, fontWeight: 700, color: "#E2E8F0",
                margin: 0, fontFamily: "'Baloo 2', sans-serif",
              }}>
                Detail Pendapatan
              </h2>
              {dateLabel ? (
                <p style={{
                  fontSize: 11, color: "#4B5563",
                  margin: "2px 0 0 0",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Calendar size={10} color="#4B5563" />
                  {dateLabel}
                </p>
              ) : null}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 8, padding: "7px 9px",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.10)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            <X size={16} color="#64748B" />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "18px 20px" }}>
          {/* Stat cards */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <StatBox
              icon={<TrendingUp size={15} />}
              label="Pendapatan Platform"
              value={fmtCurrency(totalRev)}
              color="#22D3EE"
              bg="rgba(6,182,212,0.08)"
              border="rgba(6,182,212,0.18)"
            />
            <StatBox
              icon={<ShoppingCart size={15} />}
              label="Order Selesai"
              value={totalOrders.toLocaleString("id-ID")}
              color="#A78BFA"
              bg="rgba(139,92,246,0.08)"
              border="rgba(139,92,246,0.18)"
            />
          </div>

          {/* Deskripsi */}
          {!isArray ? (
            <div style={{
              padding: "12px 14px",
              background: "rgba(6,182,212,0.05)",
              border: "1px solid rgba(6,182,212,0.10)",
              borderRadius: 10,
            }}>
              <p style={{ fontSize: 11, color: "#4B5563", margin: 0, lineHeight: 1.6 }}>
                Platform mendapat <strong style={{ color: "#22D3EE" }}>{fmtCurrency(totalRev)}</strong>{" "}
                dari <strong style={{ color: "#A78BFA" }}>{totalOrders} order</strong> yang berhasil dibayar pada hari ini.
                Fee platform dihitung otomatis saat pembayaran dikonfirmasi oleh Midtrans.
              </p>
            </div>
          ) : (
            /* Daftar hari (legacy array mode) */
            <div>
              <p style={{
                fontSize: 10, fontWeight: 600, color: "#374151",
                margin: "0 0 8px 0",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                Rincian Per Hari
              </p>
              <div style={{
                maxHeight: 240, overflowY: "auto",
                display: "flex", flexDirection: "column", gap: 7,
              }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 13px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 9,
                    transition: "background 0.15s",
                    cursor: "default",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Calendar size={13} color="#374151" />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1", margin: 0 }}>
                          {item.date || item.label}
                        </p>
                        <p style={{ fontSize: 10, color: "#374151", margin: 0 }}>
                          {item.orders ?? 0} order
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#34D399", margin: 0 }}>
                      {fmtCurrency(item.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "12px 20px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 24px",
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.25)",
              color: "#22D3EE",
              borderRadius: 9,
              fontSize: 13, fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(6,182,212,0.22)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(6,182,212,0.12)"}
          >
            Tutup
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bdFadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes modalSlideUp {
          from { opacity:0; transform:translateY(24px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
