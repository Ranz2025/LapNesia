import { useState } from "react";
import { Star, Package, User, Wrench, Send } from "lucide-react";
import { submitRating } from "../../services/ratingService";
import { toast } from "../../components/ui/Toast";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";
const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const CLR_TEXT     = "#0F172A";
const CLR_MUTED    = "#475569";
const CLR_SUBTLE   = "#94A3B8";
const CLR_BORDER   = "#E2E8F0";
const CLR_ACCENT   = "#2563EB";

/* ─── Star input interaktif ─── */
function StarInput({ value, onChange, size = 28 }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95"
          aria-label={`${n} bintang`}
        >
          <Star
            size={size}
            className="transition-colors"
            style={
              n <= active
                ? { fill: "#F59E0B", color: "#F59E0B" }
                : { fill: "rgba(148,163,184,0.25)", color: "#CBD5E1" }
            }
          />
        </button>
      ))}
      {value > 0 && (
        <span className="self-center text-xs font-semibold ml-1" style={{ color: "#F59E0B" }}>
          {["", "Sangat Buruk", "Kurang", "Cukup", "Bagus", "Sempurna"][value]}
        </span>
      )}
    </div>
  );
}

/* ─── Section card rating ─── */
function RatingSection({ icon, title, subtitle, rating, onRatingChange, review, onReviewChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="rounded-xl p-4 space-y-3 transition-all"
      style={{
        background: "#FAFBFF",
        border: `1.5px solid ${rating > 0 ? "rgba(37,99,235,0.25)" : CLR_BORDER}`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(37,99,235,0.08)", color: CLR_ACCENT }}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: CLR_TEXT }}>{title}</p>
          {subtitle && <p className="text-[11px]" style={{ color: CLR_SUBTLE }}>{subtitle}</p>}
        </div>
        {rating > 0 && (
          <span
            className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(245,158,11,0.12)", color: "#D97706" }}
          >
            {rating}/5
          </span>
        )}
      </div>

      <StarInput value={rating} onChange={onRatingChange} size={26} />

      <div
        className="rounded-lg transition-all"
        style={{
          border: `1.5px solid ${focused ? CLR_ACCENT : CLR_BORDER}`,
          background: "#FFFFFF",
          boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.10)" : "none",
        }}
      >
        <textarea
          value={review}
          onChange={(e) => onReviewChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          maxLength={500}
          rows={2}
          className="w-full px-3 py-2.5 text-sm resize-none outline-none rounded-lg placeholder:text-[#94A3B8]"
          style={{ background: "transparent", color: CLR_TEXT, fontFamily: FONT_BODY }}
        />
        <p className="text-right text-[10px] px-3 pb-1.5" style={{ color: CLR_SUBTLE }}>
          {review.length}/500
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════ */
export default function RatingForm({ orderId, hasTechnician = false, onSuccess }) {
  const [sellerRating,   setSellerRating]   = useState(0);
  const [sellerReview,   setSellerReview]   = useState("");
  const [productRating,  setProductRating]  = useState(0);
  const [productReview,  setProductReview]  = useState("");
  const [techRating,     setTechRating]     = useState(0);
  const [techReview,     setTechReview]     = useState("");
  const [loading,        setLoading]        = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sellerRating)  { toast.error("Berikan rating untuk penjual."); return; }
    if (!productRating) { toast.error("Berikan rating untuk produk."); return; }
    setLoading(true);
    try {
      await submitRating({
        order_id:           orderId,
        seller_rating:      sellerRating,
        seller_review:      sellerReview  || null,
        product_rating:     productRating,
        product_review:     productReview || null,
        technician_rating:  hasTechnician ? techRating || null : null,
        technician_review:  hasTechnician ? techReview || null : null,
      });
      toast.success("Terima kasih! Rating berhasil dikirim.");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim rating.");
    } finally {
      setLoading(false);
    }
  };

  const allFilled = sellerRating > 0 && productRating > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl overflow-hidden"
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}`, boxShadow: "0 4px 20px rgba(37,99,235,0.06)" }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(8,145,178,0.06) 100%)", borderBottom: `1px solid ${CLR_BORDER}` }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(37,99,235,0.10)", color: CLR_ACCENT }}
        >
          <Star size={16} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: CLR_TEXT, fontFamily: FONT_DISPLAY }}>Berikan Ulasan</p>
          <p className="text-[11px]" style={{ color: CLR_MUTED }}>Bantu pembeli lain dengan ulasanmu yang jujur</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Rating Produk */}
        <RatingSection
          icon={<Package size={15} />}
          title="Rating Produk"
          subtitle="Seberapa puas dengan kondisi laptop?"
          rating={productRating}
          onRatingChange={setProductRating}
          review={productReview}
          onReviewChange={setProductReview}
          placeholder="Ceritakan kondisi produk, kesesuaian deskripsi, dll... (opsional)"
        />

        {/* Rating Penjual */}
        <RatingSection
          icon={<User size={15} />}
          title="Rating Penjual"
          subtitle="Seberapa puas dengan pelayanan penjual?"
          rating={sellerRating}
          onRatingChange={setSellerRating}
          review={sellerReview}
          onReviewChange={setSellerReview}
          placeholder="Bagaimana respon dan pelayanan penjual? (opsional)"
        />

        {/* Rating Teknisi (opsional) */}
        {hasTechnician && (
          <RatingSection
            icon={<Wrench size={15} />}
            title="Rating Teknisi"
            subtitle="Seberapa puas dengan hasil inspeksi?"
            rating={techRating}
            onRatingChange={setTechRating}
            review={techReview}
            onReviewChange={setTechReview}
            placeholder="Bagaimana profesionalisme dan hasil kerja teknisi? (opsional)"
          />
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !allFilled}
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: GRAD_PRIMARY, color: "#fff", fontFamily: FONT_DISPLAY, boxShadow: allFilled ? "0 8px 20px -8px rgba(37,99,235,0.45)" : "none" }}
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Mengirim...
            </>
          ) : (
            <>
              <Send size={15} /> Kirim Ulasan
            </>
          )}
        </button>

        {!allFilled && (
          <p className="text-center text-[11px]" style={{ color: CLR_SUBTLE }}>
            Rating produk dan penjual wajib diisi
          </p>
        )}
      </div>
    </form>
  );
}
