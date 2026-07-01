import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { getTechnicianById, createInspectionJob } from "../../services/inspectionService";
import { startChat } from "../../services/chatService";
import api from "../../services/api";
import { toast } from "../../components/ui/Toast";
import {
  ChevronLeft, BadgeCheck, Sparkles, ClipboardCheck,
  AlertCircle, MapPin, Clock, Star, Briefcase, FileText, Info, MessageCircle,
} from "lucide-react";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";
const GRAD_PRIMARY  = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const GRAD_HERO_BG  = "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)";
const GRAD_CARD_BG  = "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)";
const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";
const SECTION_X     = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

function SectionLabel({ icon, text, color = "#2563EB", bg = "rgba(37,99,235,0.08)", border = "rgba(37,99,235,0.20)" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {icon} {text}
    </span>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "rgba(37,99,235,0.07)", border: `1px solid ${CLR_BORDER}` }}>
      <span style={{ color: CLR_ACCENT }}>{icon}</span>
      <div>
        <p className="text-xs font-bold leading-none" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>{value}</p>
        <p className="text-[10px] mt-0.5" style={{ color: CLR_MUTED }}>{label}</p>
      </div>
    </div>
  );
}

export default function TechnicianDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const product_id  = state?.product_id ?? "";
  const productSlug = state?.product_slug ?? "";

  const [technician,    setTechnician]    = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [laptopAddress, setLaptopAddress] = useState("");
  const [notes,         setNotes]         = useState("");
  const [startingChat,  setStartingChat]  = useState(false);

  /* ── Fetch teknisi ── */
  useEffect(() => {
    (async () => {
      try {
        const techResult = await getTechnicianById(id);
        const raw = techResult?.data ?? techResult;
        setTechnician({
          ...raw,
          name:           raw?.name ?? "",
          rating:         raw?.rating_avg ?? raw?.rating ?? 5.0,
          total_jobs:     raw?.total_inspections ?? raw?.total_jobs ?? 0,
          specialization: raw?.skills ?? raw?.specialization ?? "",
          location:       raw?.location ?? raw?.user?.city ?? "",
          bio:            raw?.bio ?? "",
          inspection_fee: raw?.inspection_fee ?? 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ── Ambil laptop_address dari product ── */
  useEffect(() => {
    const identifier = productSlug || product_id;
    if (!identifier) return;
    (async () => {
      try {
        const res = await api.get(`/v1/products/${identifier}`);
        const loc = res.data?.data?.location ?? res.data?.location ?? "";
        setLaptopAddress(loc);
      } catch {
        // tidak kritikal
      }
    })();
  }, [product_id, productSlug]);

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product_id) return toast.error("Produk tidak ditemukan. Kembali dari halaman laptop.");
    setSubmitting(true);
    try {
      const res = await createInspectionJob({
        product_id,
        technician_id:    id,
        laptop_address:   laptopAddress || "Alamat belum tersedia",
        inspection_notes: notes || null,
      });
      const job = res?.data ?? res;
      toast.success("Permintaan inspeksi berhasil dibuat!");
      navigate(`/inspection-orders/${job.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuat permintaan inspeksi.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Start Chat ── */
  const handleChat = async () => {
    setStartingChat(true);
    try {
      const res = await startChat(technician.id);
      const room = res?.data?.data ?? res?.data ?? res;
      navigate(`/chat/${room.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuka chat.");
    } finally {
      setStartingChat(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: FONT_BODY }}>
      <Navbar />
      <div className={`${SECTION_X} py-8`}>
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-3xl lg:col-span-1" style={{ background: "#E2E8F0" }} />
          <div className="h-80 rounded-3xl lg:col-span-2" style={{ background: "#E2E8F0" }} />
        </div>
      </div>
    </div>
  );

  if (!technician) return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: FONT_BODY }}>
      <Navbar />
      <div className={`${SECTION_X} py-20 flex flex-col items-center text-center`}>
        <AlertCircle size={40} style={{ color: CLR_SUBTLE }} className="mb-3" />
        <p className="text-sm" style={{ color: CLR_MUTED }}>Teknisi tidak ditemukan</p>
      </div>
    </div>
  );

  const feeFormatted = new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(technician.inspection_fee || 0);

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#F0F9FF" }} />
      <Navbar />

      <main className={`${SECTION_X} py-8`}>
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm mb-6 font-medium"
          style={{ color: CLR_ACCENT }}
        >
          <ChevronLeft size={16} /> Kembali
        </button>

        {/* ── Hero card ── */}
        <div
          className="rounded-3xl overflow-hidden relative mb-6"
          style={{ background: GRAD_HERO_BG, border: `1px solid ${CLR_BORDER}` }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 px-6 sm:px-10 py-10">
            {/* Avatar */}
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-white text-4xl font-bold flex-shrink-0"
              style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}
            >
              {technician.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <SectionLabel icon={<BadgeCheck size={11} />} text="Teknisi Terverifikasi" />
              <h1
                className="text-2xl sm:text-3xl mt-3 mb-3 truncate"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}
              >
                {technician.name}
              </h1>
              {/* Stats pills */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center">
                <StatPill icon={<Star size={13} />} label="Rating" value={`${Number(technician.rating).toFixed(1)} / 5`} />
                <StatPill icon={<Briefcase size={13} />} label="Inspeksi" value={technician.total_jobs} />
                <StatPill icon={<Clock size={13} />} label="Biaya" value={feeFormatted} />
                {/* Tombol Chat */}
                <button
                  onClick={handleChat}
                  disabled={startingChat}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                  style={{ background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY, boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}
                >
                  <MessageCircle size={14} />
                  {startingChat ? "Membuka..." : "Chat"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left: bio + info */}
          <div className="lg:col-span-1 space-y-5">
            {/* Bio */}
            <div className="rounded-3xl p-6" style={{ background: GRAD_CARD_BG, border: `1px solid ${CLR_BORDER}` }}>
              <SectionLabel icon={<Sparkles size={11} />} text="Tentang Teknisi" />
              {technician.bio
                ? <p className="text-sm leading-relaxed mt-3" style={{ color: CLR_MUTED }}>{technician.bio}</p>
                : <p className="text-sm italic mt-3" style={{ color: CLR_SUBTLE }}>Teknisi belum menambahkan deskripsi.</p>
              }
              {technician.specialization && (
                <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: CLR_SUBTLE }}>Keahlian</p>
                  <p className="text-sm" style={{ color: CLR_TEXT }}>{technician.specialization}</p>
                </div>
              )}
            </div>

            {/* Info jadwal */}
            <div
              className="rounded-3xl p-5 flex items-start gap-3"
              style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.25)" }}
            >
              <Clock size={17} className="flex-shrink-0 mt-0.5" style={{ color: "#CA8A04" }} />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#92400E" }}>Tentang Jadwal Inspeksi</p>
                <p className="text-xs leading-relaxed" style={{ color: "#78350F" }}>
                  Inspeksi akan dilakukan dalam <strong>1–3 hari ke depan</strong>.
                  Teknisi akan menghubungi seller untuk menentukan jadwal pasti dan memberitahu kamu melalui notifikasi.
                </p>
              </div>
            </div>
          </div>

          {/* Right: booking form */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl p-6 sm:p-8" style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}` }}>
              <div
                className="flex items-center justify-between mb-6 pb-5"
                style={{ borderBottom: `1px solid ${CLR_BORDER_LT}` }}
              >
                <div>
                  <SectionLabel icon={<ClipboardCheck size={11} />} text="Booking" />
                  <h2 className="text-xl mt-2" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: CLR_TEXT }}>
                    Buat Permintaan Inspeksi
                  </h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Laptop address (auto-filled / editable) */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={{ color: CLR_TEXT }}>
                    <MapPin size={15} style={{ color: CLR_ACCENT }} />
                    Lokasi Laptop
                  </label>
                  <div
                    className="flex items-start gap-3 rounded-2xl px-4 py-3"
                    style={{ background: "rgba(239,246,255,0.8)", border: `1px solid ${CLR_BORDER}` }}
                  >
                    <MapPin size={16} className="flex-shrink-0 mt-0.5" style={{ color: CLR_ACCENT }} />
                    <div className="flex-1 min-w-0">
                      {laptopAddress ? (
                        <p className="text-sm font-medium" style={{ color: CLR_TEXT }}>{laptopAddress}</p>
                      ) : (
                        <p className="text-sm italic" style={{ color: CLR_SUBTLE }}>
                          {product_id ? "Memuat lokasi laptop..." : "Lokasi tidak tersedia"}
                        </p>
                      )}
                      <p className="text-[11px] mt-0.5" style={{ color: CLR_SUBTLE }}>
                        Diambil otomatis dari data produk
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inspection notes */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={{ color: CLR_TEXT }}>
                    <FileText size={15} style={{ color: CLR_ACCENT }} />
                    Catatan untuk Teknisi
                    <span className="ml-1 font-normal text-xs" style={{ color: CLR_SUBTLE }}>(opsional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Contoh: Laptop sering overheat, baterai boros, dll."
                    className="w-full outline-none rounded-2xl px-4 py-3 text-sm placeholder:text-[#94A3B8] resize-none transition"
                    style={{
                      background: "#F8FAFC",
                      border: `1.5px solid ${CLR_BORDER_LT}`,
                      color: CLR_TEXT,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = CLR_ACCENT)}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = CLR_BORDER_LT)}
                  />
                  <p className="text-[11px] mt-1 text-right" style={{ color: CLR_SUBTLE }}>{notes.length}/500</p>
                </div>

                {/* Info notice */}
                <div
                  className="flex items-start gap-3 rounded-2xl px-4 py-3"
                  style={{ background: "rgba(37,99,235,0.05)", border: `1px solid rgba(37,99,235,0.15)` }}
                >
                  <Info size={15} className="flex-shrink-0 mt-0.5" style={{ color: CLR_ACCENT }} />
                  <div className="text-xs leading-relaxed" style={{ color: CLR_MUTED }}>
                    <p><strong style={{ color: CLR_TEXT }}>Pembayaran dilakukan setelah teknisi menjadwalkan inspeksi.</strong></p>
                    <p className="mt-0.5">Biaya inspeksi: <strong style={{ color: CLR_ACCENT }}>{feeFormatted}</strong></p>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!product_id || submitting}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition hover:brightness-105 active:scale-[0.99]"
                  style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 6px 20px rgba(37,99,235,0.28)" }}
                >
                  {submitting ? "Memproses..." : "Pesan Inspeksi"}
                </button>

                {!product_id && (
                  <p className="text-xs text-center" style={{ color: "#DC2626" }}>
                    Buka halaman ini dari detail produk laptop untuk memesan inspeksi.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
