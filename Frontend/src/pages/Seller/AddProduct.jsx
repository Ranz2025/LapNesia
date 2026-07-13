import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, ChevronDown, Cpu, HardDrive, Monitor,
  MapPin, Tag, AlignLeft, DollarSign, X, Sparkles,
  ShieldCheck, ImagePlus
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { createProduct } from "../../services/productService";
import { toast } from "../../components/ui/Toast";

/* ─── DESIGN TOKENS (shared with Home / Laptop / DetailLaptop) ─── */
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

const unwrapData = (payload) => {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return data?.data ?? data ?? [];
};

/* ---- Reusable styled field components ---- */
function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: CLR_MUTED }}>
      {children}
      {required && <span style={{ color: CLR_ACCENT }}> *</span>}
    </label>
  );
}

function StyledInput({ error, icon: Icon, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
      style={{
        background: "#F8FAFC",
        border: `1.5px solid ${error ? CLR_DANGER : focused ? CLR_ACCENT : CLR_BORDER_LT}`,
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

function StyledSelect({ error, icon: Icon, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
      style={{
        background: "#F8FAFC",
        border: `1.5px solid ${error ? CLR_DANGER : focused ? CLR_ACCENT : CLR_BORDER_LT}`,
        boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
      }}
    >
      {Icon && <Icon size={15} style={{ color: focused ? CLR_ACCENT : CLR_SUBTLE, flexShrink: 0 }} />}
      <select
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: "transparent",
          color: props.value ? CLR_TEXT : CLR_SUBTLE,
          outline: "none", width: "100%", fontSize: 14, appearance: "none", cursor: "pointer",
        }}
      >
        {children}
      </select>
      <ChevronDown size={14} style={{ color: CLR_SUBTLE, flexShrink: 0 }} />
    </div>
  );
}

function StyledTextarea({ error, icon: Icon, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="flex gap-3 rounded-xl px-4 py-3 transition-all"
      style={{
        background: "#F8FAFC",
        border: `1.5px solid ${error ? CLR_DANGER : focused ? CLR_ACCENT : CLR_BORDER_LT}`,
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

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs font-medium" style={{ color: CLR_DANGER }}>{msg}</p>;
}

/* ---- Section header inside the form ---- */
function SectionTitle({ step, children }) {
  return (
    <div className="flex items-center gap-2.5 pt-1 pb-1">
      <span
        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
        style={{ background: GRAD_PRIMARY }}
      >
        {step}
      </span>
      <span className="text-sm font-semibold" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>
        {children}
      </span>
    </div>
  );
}

/* ---- Step progress pill (reflects scroll position within one continuous form, not separate pages) ---- */
function StepPill({ num, label }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
        style={{ background: GRAD_PRIMARY }}
      >
        {num}
      </span>
      <span className="text-xs font-medium hidden sm:inline" style={{ color: CLR_MUTED }}>{label}</span>
    </div>
  );
}

/* ======================================================= */
export default function AddProduct() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    brand_id: "", category_id: "", model: "", cpu: "", ram: "", storage: "",
    storage_type: "SSD", gpu: "", screen_size: "", price: "", condition: "good",
    location: "", description: "", images: [], stock: "1", inspection_ready: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const e = {};
    if (!formData.brand_id) e.brand_id = "Brand wajib diisi";
    if (!formData.category_id) e.category_id = "Kategori wajib diisi";
    if (!formData.model.trim()) e.model = "Model wajib diisi";
    if (!formData.cpu.trim()) e.cpu = "CPU wajib diisi";
    const ram = Number(formData.ram), storage = Number(formData.storage), price = Number(formData.price);
    const stock = Number(formData.stock);
    if (formData.ram === "" || isNaN(ram)) e.ram = "RAM wajib diisi";
    else if (ram < 0) e.ram = "RAM tidak boleh minus";
    if (formData.storage === "" || isNaN(storage)) e.storage = "Storage wajib diisi";
    else if (storage < 0) e.storage = "Storage tidak boleh minus";
    if (!formData.screen_size.trim()) e.screen_size = "Ukuran layar wajib diisi";
    if (formData.price === "" || isNaN(price)) e.price = "Harga wajib diisi";
    else if (price < 0) e.price = "Harga tidak boleh minus";
    if (formData.stock === "" || isNaN(stock)) e.stock = "Jumlah stok wajib diisi";
    else if (stock < 1) e.stock = "Stok minimal 1 unit";
    if (!formData.location.trim()) e.location = "Lokasi wajib diisi";
    if (!formData.description.trim()) e.description = "Deskripsi wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    (async () => {
      try {
        const [b, c] = await Promise.all([api.get("/v1/brands"), api.get("/v1/categories")]);
        setBrands(unwrapData(b));
        setCategories(unwrapData(c));
      } catch {}
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(urls);
    setFormData({ ...formData, images: urls });
  };

  const removeImage = (idx) => {
    const updated = imagePreviews.filter((_, i) => i !== idx);
    setImagePreviews(updated);
    setFormData({ ...formData, images: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.error("Mohon isi semua field yang wajib!"); return; }
    setLoading(true);
    try {
      await createProduct({
        ...formData,
        ram: parseInt(formData.ram),
        storage: parseInt(formData.storage),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        inspection_ready: formData.inspection_ready ? 1 : 0,
      });
      toast.success("Produk berhasil ditambahkan.");
      setTimeout(() => navigate("/seller/products"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambah produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      <Navbar />

      {/* ══════════════ AMBIENT GLOW BACKDROP ══════════════ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-16 w-[480px] h-[480px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
        <div className="absolute top-[55%] -left-20 w-[420px] h-[420px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
      </div>


      <main className={`${SECTION_X} pb-20 pt-8`}>

        {/* Page header */}
        <div className="mb-7">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold mb-3"
            style={{ color: CLR_ACCENT, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)" }}
          >
            <Sparkles size={11} /> Seller Dashboard
          </span>
          <h1 className="text-3xl leading-tight mb-2" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, color: CLR_TEXT }}>
            Tambah{" "}
            <span style={{ backgroundImage: GRAD_PRIMARY, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              Produk Baru
            </span>
          </h1>
          <p className="text-sm" style={{ color: CLR_MUTED }}>
            Isi detail laptop kamu. Setiap listing wajib melewati inspeksi oleh teknisi tersertifikasi sebelum tayang.
          </p>
        </div>

        {/* Step overview strip — informational, not interactive pagination, since all sections live in one form below */}
        <div
          className="flex items-center justify-between gap-3 mb-6 px-5 py-4 rounded-2xl"
          style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 12px rgba(37,99,235,0.06)" }}
        >
          <StepPill num="1" label="Identitas" />
          <div className="flex-1 h-px" style={{ background: CLR_BORDER_LT }} />
          <StepPill num="2" label="Spesifikasi" />
          <div className="flex-1 h-px" style={{ background: CLR_BORDER_LT }} />
          <StepPill num="3" label="Harga" />
          <div className="flex-1 h-px" style={{ background: CLR_BORDER_LT }} />
          <StepPill num="4" label="Foto" />
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit}>
          <div
            className="rounded-2xl p-6 sm:p-8 space-y-7"
            style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 4px 24px rgba(37,99,235,0.06)" }}
          >

            {/* === Section 1: Identitas === */}
            <div className="space-y-4">
              <SectionTitle step="1">Identitas Produk</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>Brand</FieldLabel>
                  <StyledSelect name="brand_id" value={formData.brand_id} onChange={handleChange} error={errors.brand_id} icon={Tag}>
                    <option value="">Pilih Brand</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </StyledSelect>
                  <ErrorMsg msg={errors.brand_id} />
                </div>
                <div>
                  <FieldLabel required>Kategori</FieldLabel>
                  <StyledSelect name="category_id" value={formData.category_id} onChange={handleChange} error={errors.category_id} icon={Tag}>
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </StyledSelect>
                  <ErrorMsg msg={errors.category_id} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel required>Model</FieldLabel>
                  <StyledInput
                    type="text" name="model" placeholder="Contoh: ThinkPad X1 Carbon Gen 11"
                    value={formData.model} onChange={handleChange} error={errors.model}
                  />
                  <ErrorMsg msg={errors.model} />
                </div>
                <div>
                  <FieldLabel required>Kondisi</FieldLabel>
                  <StyledSelect name="condition" value={formData.condition} onChange={handleChange}>
                    <option value="good">Baik</option>
                    <option value="very_good">Sangat Baik</option>
                    <option value="like_new">Seperti Baru</option>
                  </StyledSelect>
                </div>
                <div>
                  <FieldLabel required>Lokasi</FieldLabel>
                  <StyledInput
                    type="text" name="location" placeholder="Contoh: Yogyakarta"
                    value={formData.location} onChange={handleChange} error={errors.location} icon={MapPin}
                  />
                  <ErrorMsg msg={errors.location} />
                </div>
              </div>
            </div>

            {/* === Section 2: Spesifikasi === */}
            <div className="space-y-4 pt-2" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
              <SectionTitle step="2">Spesifikasi</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <FieldLabel required>Prosesor (CPU)</FieldLabel>
                  <StyledInput
                    type="text" name="cpu" placeholder="Contoh: Intel Core i7-1365U"
                    value={formData.cpu} onChange={handleChange} error={errors.cpu} icon={Cpu}
                  />
                  <ErrorMsg msg={errors.cpu} />
                </div>
                <div>
                  <FieldLabel required>RAM (GB)</FieldLabel>
                  <StyledInput
                    type="number" name="ram" placeholder="Contoh: 16"
                    value={formData.ram} onChange={handleChange} error={errors.ram}
                  />
                  <ErrorMsg msg={errors.ram} />
                </div>
                <div>
                  <FieldLabel required>Storage (GB)</FieldLabel>
                  <StyledInput
                    type="number" name="storage" placeholder="Contoh: 512"
                    value={formData.storage} onChange={handleChange} error={errors.storage} icon={HardDrive}
                  />
                  <ErrorMsg msg={errors.storage} />
                </div>
                <div>
                  <FieldLabel>Tipe Storage</FieldLabel>
                  <StyledSelect name="storage_type" value={formData.storage_type} onChange={handleChange} icon={HardDrive}>
                    <option value="SSD">SSD</option>
                    <option value="HDD">HDD</option>
                    <option value="NVMe">NVMe</option>
                  </StyledSelect>
                </div>
                <div>
                  <FieldLabel>GPU (Opsional)</FieldLabel>
                  <StyledInput
                    type="text" name="gpu" placeholder="Contoh: NVIDIA RTX 4060"
                    value={formData.gpu} onChange={handleChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel required>Ukuran Layar</FieldLabel>
                  <StyledInput
                    type="text" name="screen_size" placeholder='Contoh: 14"'
                    value={formData.screen_size} onChange={handleChange} error={errors.screen_size} icon={Monitor}
                  />
                  <ErrorMsg msg={errors.screen_size} />
                </div>
              </div>
            </div>

            {/* === Section 3: Harga & Deskripsi === */}
            <div className="space-y-4 pt-2" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
              <SectionTitle step="3">Harga &amp; Deskripsi</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>Harga (Rp)</FieldLabel>
                  <StyledInput
                    type="number" name="price" placeholder="Contoh: 8500000"
                    value={formData.price} onChange={handleChange} error={errors.price} icon={DollarSign}
                  />
                  {formData.price && !errors.price && (
                    <p className="mt-1.5 text-xs font-medium" style={{ color: CLR_ACCENT }}>
                      Rp {Number(formData.price).toLocaleString("id-ID")}
                    </p>
                  )}
                  <ErrorMsg msg={errors.price} />
                </div>
                <div>
                  <FieldLabel required>Jumlah Stok</FieldLabel>
                  <StyledInput
                    type="number" name="stock" placeholder="Contoh: 1" min="1"
                    value={formData.stock} onChange={handleChange} error={errors.stock}
                  />
                  <ErrorMsg msg={errors.stock} />
                </div>
              </div>
              <div>
                <FieldLabel required>Deskripsi</FieldLabel>
                <StyledTextarea
                  name="description" rows={5}
                  placeholder="Ceritakan kondisi, kelengkapan, dan keunggulan laptop ini..."
                  value={formData.description} onChange={handleChange} error={errors.description}
                  icon={AlignLeft}
                />
                <ErrorMsg msg={errors.description} />
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

            {/* === Section 4: Upload Foto === */}
            <div className="space-y-4 pt-2" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
              <SectionTitle step="4">Foto Produk</SectionTitle>

              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center gap-3 rounded-2xl p-8 cursor-pointer transition-all"
                style={{ border: `2px dashed ${CLR_BORDER}`, background: "rgba(37,99,235,0.03)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = CLR_ACCENT)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = CLR_BORDER)}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(37,99,235,0.10)" }}
                >
                  <Upload size={20} style={{ color: CLR_ACCENT }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: CLR_TEXT }}>Klik untuk upload foto</p>
                  <p className="text-xs mt-1" style={{ color: CLR_SUBTLE }}>PNG, JPG, WEBP — maks. 5 foto</p>
                </div>
                <input
                  id="image-upload" type="file" multiple accept="image/*"
                  onChange={handleImageChange} className="hidden"
                />
              </label>

              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img
                        src={src} alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                        style={{ border: `1px solid ${CLR_BORDER}` }}
                      />
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
                        onClick={() => removeImage(idx)}
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
                <div className="flex items-center gap-2 text-xs" style={{ color: CLR_SUBTLE }}>
                  <ImagePlus size={13} />
                  Belum ada foto dipilih. Foto pertama akan jadi gambar utama.
                </div>
              )}
            </div>
          </div>

          {/* Inspection reminder */}
          <div
            className="flex items-center gap-3 mt-5 px-5 py-3.5 rounded-2xl"
            style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.18)" }}
          >
            <ShieldCheck size={16} style={{ color: CLR_ACCENT }} className="flex-shrink-0" />
            <p className="text-xs" style={{ color: CLR_MUTED }}>
              Setelah disimpan, produk berstatus <span className="font-semibold" style={{ color: CLR_TEXT }}>menunggu inspeksi</span> dan
              baru tayang ke pembeli setelah teknisi memverifikasi kondisi unit.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition hover:bg-[#EFF6FF]"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER}`, color: CLR_MUTED, fontFamily: FONT_DISPLAY }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3.5 rounded-2xl text-sm font-semibold transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: GRAD_PRIMARY, color: "#0F172A", fontFamily: FONT_DISPLAY, boxShadow: "0 6px 24px rgba(37,99,235,0.30)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Menyimpan...
                </span>
              ) : "Tambah Produk →"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}