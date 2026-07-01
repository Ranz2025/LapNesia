import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronDown, Cpu, HardDrive, MapPin,
  AlignLeft, DollarSign, X, Sparkles, Upload, ImagePlus, ShieldCheck, Package
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { PageLoader } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import api from "../../services/api";

/* ─── DESIGN TOKENS (shared across all pages) ─────────────── */
const FONT_DISPLAY  = "'Baloo 2', sans-serif";
const FONT_BODY     = "'Inter', sans-serif";
const GRAD_PRIMARY  = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#94A3B8";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";
const CLR_DANGER    = "#EF4444";

const SECTION_X = "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8";

/* ---- Reusable styled field components (shared pattern with AddProduct) ---- */
function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: CLR_MUTED }}>
      {children}
      {required && <span style={{ color: CLR_ACCENT }}> *</span>}
    </label>
  );
}

function StyledInput({ icon: Icon, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
      style={{
        background: "#F8FAFC",
        border: `1.5px solid ${focused ? CLR_ACCENT : CLR_BORDER_LT}`,
        boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
      }}
    >
      {Icon && <Icon size={15} style={{ color: focused ? CLR_ACCENT : CLR_SUBTLE, flexShrink: 0 }} />}
      <input
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ background: "transparent", color: CLR_TEXT, outline: "none", width: "100%", fontSize: 14 }}
        className="placeholder:text-[#94A3B8]"
      />
    </div>
  );
}

function StyledSelect({ icon: Icon, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
      style={{
        background: "#F8FAFC",
        border: `1.5px solid ${focused ? CLR_ACCENT : CLR_BORDER_LT}`,
        boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
      }}
    >
      {Icon && <Icon size={15} style={{ color: focused ? CLR_ACCENT : CLR_SUBTLE, flexShrink: 0 }} />}
      <select
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ background: "transparent", color: CLR_TEXT, outline: "none", width: "100%", fontSize: 14, appearance: "none", cursor: "pointer" }}
      >
        {children}
      </select>
      <ChevronDown size={14} style={{ color: CLR_SUBTLE, flexShrink: 0 }} />
    </div>
  );
}

function StyledTextarea({ icon: Icon, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="flex gap-3 rounded-xl px-4 py-3 transition-all"
      style={{
        background: "#F8FAFC",
        border: `1.5px solid ${focused ? CLR_ACCENT : CLR_BORDER_LT}`,
        boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
      }}
    >
      {Icon && <Icon size={15} style={{ color: focused ? CLR_ACCENT : CLR_SUBTLE, flexShrink: 0, marginTop: 2 }} />}
      <textarea
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full resize-none placeholder:text-[#94A3B8]"
        style={{ background: "transparent", color: CLR_TEXT, fontSize: 14, outline: "none" }}
      />
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2.5 pt-1 pb-1">
      <span className="w-1.5 h-5 rounded-full flex-shrink-0" style={{ background: GRAD_PRIMARY }} />
      <span className="text-sm font-semibold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
        {children}
      </span>
    </div>
  );
}

function SectionLabel({ icon, text, color = CLR_ACCENT, bg = "rgba(37,99,235,0.08)", border = "rgba(37,99,235,0.20)" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-3"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {icon} {text}
    </span>
  );
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    model: "", cpu: "", ram: "", storage: "", price: "", condition: "good",
    location: "", description: "", stock: "1", inspection_ready: false
  });
  const [images, setImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.get(`/v1/seller/products/${id}`);
      const product = result.data.data || result.data;
      setFormData({
        model: product.model || "",
        cpu: product.cpu || "",
        ram: product.ram || "",
        storage: product.storage || "",
        price: product.price || "",
        condition: product.condition || "good",
        location: product.location || "",
        description: product.description || "",
        stock: product.stock ?? 1,
        inspection_ready: product.inspection_ready ?? false,
      });
      setExistingImages(product.all_images || []);
    } catch (err) {
      setError(err.message || "Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setNewImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeNewImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'inspection_ready') {
          data.append(key, formData[key] ? 1 : 0);
        } else if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      images.forEach(img => data.append('images[]', img));
      deletedImageIds.forEach(imgId => data.append('delete_images[]', imgId));

      await api.post(`/v1/seller/products/${id}?_method=PUT`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Produk berhasil diperbarui.");
      navigate("/seller/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperbarui produk.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div style={{ fontFamily: FONT_BODY }}>
        <Navbar />
        <div className={`${SECTION_X} py-24 text-center`}>
          <p className="text-sm mb-4" style={{ color: CLR_DANGER }}>{error}</p>
          <button
            onClick={fetchProduct}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition hover:brightness-110"
            style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      <Navbar />

      {/* ══════════════ AMBIENT GLOW BACKDROP ══════════════ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>

      <main className={`${SECTION_X} pb-20 pt-8`}>

        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/seller/products")}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition hover:gap-2.5 mb-5"
          style={{ color: CLR_MUTED }}
        >
          <ChevronLeft size={16} /> Kembali ke Produk Saya
        </button>

        {/* Page header */}
        <div className="mb-7">
          <SectionLabel icon={<Sparkles size={11} />} text="Seller Dashboard" />
          <h1 className="text-3xl leading-tight mb-2 mt-3" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}>
            Edit{" "}
            <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              Produk
            </span>
          </h1>
          <p className="text-sm" style={{ color: CLR_MUTED }}>
            {formData.model ? `Memperbarui detail untuk "${formData.model}".` : "Perbarui detail dan foto produkmu."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="rounded-2xl p-6 sm:p-8 space-y-7"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 4px 24px rgba(37,99,235,0.06)" }}
          >

            {/* === Identitas & Spesifikasi === */}
            <div className="space-y-4">
              <SectionTitle>Identitas &amp; Spesifikasi</SectionTitle>
              <div>
                <FieldLabel required>Model Laptop</FieldLabel>
                <StyledInput
                  type="text" placeholder="Masukkan model laptop" value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <FieldLabel>CPU</FieldLabel>
                  <StyledInput
                    type="text" placeholder="Contoh: Core i7" value={formData.cpu}
                    onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                    icon={Cpu}
                  />
                </div>
                <div>
                  <FieldLabel>RAM (GB)</FieldLabel>
                  <StyledInput
                    type="number" placeholder="Contoh: 16" value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Storage (GB)</FieldLabel>
                  <StyledInput
                    type="number" placeholder="Contoh: 512" value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    icon={HardDrive}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Kondisi</FieldLabel>
                <StyledSelect
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                >
                  <option value="good">Baik</option>
                  <option value="very_good">Sangat Baik</option>
                  <option value="like_new">Seperti Baru</option>
                </StyledSelect>
              </div>
            </div>

            {/* === Harga & Lokasi === */}
            <div className="space-y-4 pt-2" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
              <SectionTitle>Harga &amp; Lokasi</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>Harga (Rp)</FieldLabel>
                  <StyledInput
                    type="number" placeholder="Contoh: 7500000" value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    icon={DollarSign}
                    required
                  />
                  {formData.price && (
                    <p className="mt-1.5 text-xs font-medium" style={{ color: CLR_ACCENT }}>
                      Rp {Number(formData.price).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
                <div>
                  <FieldLabel required>Jumlah Stok</FieldLabel>
                  <StyledInput
                    type="number" placeholder="Contoh: 1" min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    icon={Package}
                  />
                </div>
                <div>
                  <FieldLabel>Lokasi</FieldLabel>
                  <StyledInput
                    type="text" placeholder="Contoh: Jakarta" value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    icon={MapPin}
                  />
                </div>
              </div>
            </div>

            {/* === Deskripsi === */}
            <div className="space-y-4 pt-2" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
              <SectionTitle>Deskripsi</SectionTitle>
              <div>
                <FieldLabel>Deskripsi Laptop</FieldLabel>
                <StyledTextarea
                  placeholder="Jelaskan detail spesifikasi dan kondisi laptop..." value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  icon={AlignLeft}
                />
              </div>

              {/* Checkbox: Bersedia Inspeksi */}
              <div
                className="flex items-start gap-3 rounded-xl p-4 cursor-pointer select-none transition-all"
                style={{
                  background: formData.inspection_ready ? "rgba(37,99,235,0.06)" : "#F8FAFC",
                  border: `1.5px solid ${formData.inspection_ready ? CLR_ACCENT : CLR_BORDER_LT}`,
                }}
                onClick={() => setFormData({ ...formData, inspection_ready: !formData.inspection_ready })}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={{
                    background: formData.inspection_ready ? CLR_ACCENT : "#FFFFFF",
                    border: `2px solid ${formData.inspection_ready ? CLR_ACCENT : CLR_BORDER_LT}`,
                  }}
                >
                  {formData.inspection_ready && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: CLR_TEXT }}>Bersedia Inspeksi Teknisi</p>
                  <p className="text-xs mt-0.5" style={{ color: CLR_MUTED }}>
                    Centang jika kamu bersedia produk ini diinspeksi oleh teknisi kami. Produk yang diinspeksi mendapat badge "Terverifikasi" dan lebih dipercaya buyer.
                  </p>
                </div>
              </div>
            </div>

            {/* === Foto Produk === */}
            <div className="space-y-4 pt-2" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
              <SectionTitle>Foto Produk</SectionTitle>

              {existingImages.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-3" style={{ color: CLR_MUTED }}>Gambar saat ini</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {existingImages.map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative group aspect-square rounded-xl overflow-hidden"
                        style={{ border: `1px solid ${CLR_BORDER}` }}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span
                            className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-md text-white"
                            style={{ background: GRAD_PRIMARY }}
                          >
                            Utama
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setDeletedImageIds([...deletedImageIds, img.id]);
                            setExistingImages(existingImages.filter((i) => i.id !== img.id));
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: CLR_DANGER }}
                          aria-label="Hapus gambar"
                        >
                          <X size={11} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-medium mb-3" style={{ color: CLR_MUTED }}>Tambah gambar baru</p>
                <label
                  htmlFor="new-image-upload"
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl p-7 cursor-pointer transition-all"
                  style={{ border: `2px dashed ${CLR_BORDER}`, background: "rgba(37,99,235,0.03)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = CLR_ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = CLR_BORDER)}
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(37,99,235,0.10)" }}>
                    <Upload size={18} style={{ color: CLR_ACCENT }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold" style={{ color: CLR_TEXT }}>Klik untuk upload foto</p>
                    <p className="text-xs mt-1" style={{ color: CLR_SUBTLE }}>PNG, JPG, WEBP</p>
                  </div>
                  <input
                    id="new-image-upload" type="file" multiple accept="image/*"
                    onChange={handleNewImages} className="hidden"
                  />
                </label>

                {newImagePreviews.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
                    {newImagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={src} alt={`Baru ${idx + 1}`}
                          className="w-full h-full object-cover rounded-xl"
                          style={{ border: `1px solid ${CLR_BORDER}` }}
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: CLR_DANGER }}
                          aria-label="Hapus foto"
                        >
                          <X size={11} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs mt-3" style={{ color: CLR_SUBTLE }}>
                    <ImagePlus size={13} />
                    Belum ada foto baru dipilih.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inspection reminder */}
          <div
            className="flex items-center gap-3 mt-5 px-5 py-3.5 rounded-2xl"
            style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.18)" }}
          >
            <ShieldCheck size={16} style={{ color: CLR_ACCENT }} className="flex-shrink-0" />
            <p className="text-xs" style={{ color: CLR_MUTED }}>
              Mengubah spesifikasi atau kondisi dapat memengaruhi status inspeksi. Produk mungkin perlu
              <span className="font-semibold" style={{ color: CLR_TEXT }}> diinspeksi ulang</span> sebelum tayang kembali.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={() => navigate("/seller/products")}
              className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition hover:bg-[#EFF6FF]"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}`, color: CLR_MUTED, fontFamily: FONT_DISPLAY }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] py-3.5 rounded-2xl text-sm font-semibold transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY, boxShadow: "0 6px 24px rgba(37,99,235,0.30)" }}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Menyimpan...
                </span>
              ) : "Perbarui Produk"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}