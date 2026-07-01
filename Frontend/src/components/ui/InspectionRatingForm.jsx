import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "../../components/ui/Toast";
import { rateInspectionJob } from "../../services/inspectionService";

function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((n) => (
        <button type="button" key={n} onClick={() => onChange(n)}>
          <Star size={22} className={n <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-500"} />
        </button>
      ))}
    </div>
  );
}

export default function InspectionRatingForm({ jobId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Berikan rating teknisi.");
    setLoading(true);
    try {
      await rateInspectionJob(jobId, { rating, review: review || null });
      toast.success("Rating teknisi berhasil dikirim.");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim rating teknisi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-5" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
      <h3 className="font-semibold text-[#0F172A]">Rating Teknisi</h3>
      <div>
        <p className="text-sm font-medium text-[#0F172A] mb-2">Berikan rating</p>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={3} maxLength={500} placeholder="Ulasan teknisi (opsional)" className="w-full rounded-xl p-3 text-sm outline-none" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }} />
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: "linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)" }}>{loading ? "Mengirim..." : "Kirim Rating"}</button>
    </form>
  );
}
