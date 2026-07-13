import { useEffect, useState } from "react";
import {
  User, Camera, Save, Lock, ArrowLeft, RefreshCw, IdCard, ShieldCheck,
  ChevronDown, FileCheck2, UploadCloud, Mail, Phone, MapPin
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { toast } from "../../components/ui/Toast";
import { PageLoader } from "../../components/ui/Skeleton";
import { getProfile, updateProfile, uploadProfilePhoto, uploadCertification, changePassword } from "../../services/profileService";
import { useNavigate } from "react-router-dom";

/* ─── DESIGN TOKENS (selaras dengan Home.jsx / OrderDetail.jsx) ──── */
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

const GRAD_PRIMARY = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";

const CLR_TEXT      = "#0F172A";
const CLR_MUTED     = "#475569";
const CLR_SUBTLE    = "#64748B";
const CLR_BORDER    = "#BFDBFE";
const CLR_BORDER_LT = "#E2E8F0";
const CLR_ACCENT    = "#2563EB";

const inputBase = {
  background: "#F8FAFC",
  border: `1px solid ${CLR_BORDER_LT}`,
  color: CLR_TEXT,
};
const onFocusBlue = (e) => (e.target.style.borderColor = CLR_ACCENT);
const onBlurDefault = (e) => (e.target.style.borderColor = CLR_BORDER_LT);

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: CLR_MUTED }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs mt-1.5" style={{ color: "#94A3B8" }}>{hint}</p>}
    </div>
  );
}

function SectionCard({ icon, title, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(37,99,235,0.08)", color: CLR_ACCENT }}>
          {icon}
        </span>
        <h2 className="font-semibold text-sm" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [pwForm, setPwForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [certUploading, setCertUploading] = useState(false);

  const isTechnician = user?.role === "technician";
  const technicianProfile = user?.technicianProfile || user?.technician_profile || null;
  const certificationUrl = technicianProfile?.certification_url || user?.certification_url || null;

  const handleCertificationUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran sertifikat maksimal 5MB.");
      return;
    }
    setCertUploading(true);
    try {
      const res = await uploadCertification(file);
      const updatedProfile = res.data?.technician_profile || res.data?.technicianProfile || null;
      const nextUser = {
        ...user,
        technicianProfile: updatedProfile,
        technician_profile: updatedProfile,
      };
      setUser(nextUser);
      sessionStorage.setItem("user", JSON.stringify(nextUser));
      toast.success("Sertifikat berhasil diunggah.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal upload sertifikat.");
    } finally {
      setCertUploading(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProfile();
      setUser(res.data);
      setForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
      });
      sessionStorage.setItem("user", JSON.stringify(res.data));
    } catch {
      setError("Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(form);
      setUser(res.data);
      sessionStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Profil berhasil diperbarui.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2MB.");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadProfilePhoto(file);
      setUser(res.data);
      sessionStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Foto profil berhasil diperbarui.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal upload foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.password_confirmation) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(pwForm);
      toast.success("Password berhasil diubah.");
      setPwForm({ current_password: "", password: "", password_confirmation: "" });
      setShowPw(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengubah password.");
    } finally {
      setPwLoading(false);
    }
  };

  const AmbientBg = () => (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "#F8FAFC" }}>
      <div className="absolute -top-32 -right-16 w-[420px] h-[420px] rounded-full opacity-20 blur-[130px]" style={{ background: "#93C5FD" }} />
      <div className="absolute top-[55%] -left-20 w-[360px] h-[360px] rounded-full opacity-15 blur-[130px]" style={{ background: "#67E8F9" }} />
    </div>
  );

  if (loading) return (
    <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT_BODY }}>
      <AmbientBg />
      <Navbar />
      <PageLoader />
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT_BODY }}>
      <AmbientBg />
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm mb-6 transition font-medium"
          style={{ color: CLR_SUBTLE }}
          onMouseEnter={(e) => (e.currentTarget.style.color = CLR_ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = CLR_SUBTLE)}
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        {error ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}` }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(220,38,38,0.10)" }}>
              <RefreshCw size={24} style={{ color: "#DC2626" }} />
            </div>
            <p className="mb-4 text-sm font-medium" style={{ color: "#DC2626" }}>{error}</p>
            <button
              onClick={fetchProfile}
              className="inline-flex items-center gap-2 mx-auto text-sm font-semibold px-4 py-2 rounded-xl transition"
              style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}
            >
              <RefreshCw size={14} /> Coba Lagi
            </button>
          </div>
        ) : (
          <div className="space-y-5">

            {/* ══════════ Hero header + avatar ══════════ */}
            <div
              className="relative rounded-3xl overflow-hidden px-6 sm:px-8 py-8"
              style={{ background: GRAD_PRIMARY, boxShadow: "0 16px 40px -16px rgba(37,99,235,0.45)" }}
            >
              <div className="absolute -top-14 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />
              <div className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "#FFFFFF" }} />

              <div className="relative flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.18)", border: "3px solid rgba(255,255,255,0.5)" }}
                  >
                    {user?.profile_photo_url ? (
                      <img src={user.profile_photo_url} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-white" size={32} />
                    )}
                  </div>
                  <label
                    className="absolute -bottom-1 -right-1 rounded-full p-2 cursor-pointer transition hover:brightness-105 active:scale-95"
                    style={{ background: "#FFFFFF", color: CLR_ACCENT, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}
                  >
                    <Camera size={13} />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-extrabold text-white truncate" style={{ fontFamily: FONT_DISPLAY }}>
                    {user?.name}
                  </h1>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize mt-1.5"
                    style={{ background: "rgba(255,255,255,0.18)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.3)" }}
                  >
                    {isTechnician && <ShieldCheck size={11} />} {user?.role}
                  </span>
                  {uploading && (
                    <p className="text-xs mt-2 text-white/85 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Mengupload foto...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ══════════ Informasi pribadi ══════════ */}
            <SectionCard icon={<IdCard size={16} />} title="Informasi Pribadi">
              <form onSubmit={handleSave} className="space-y-4">
                <Field label="Nama">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl p-3 text-sm outline-none transition"
                    style={inputBase}
                    onFocus={onFocusBlue}
                    onBlur={onBlurDefault}
                  />
                </Field>
                <Field label="Email" hint="Email tidak dapat diubah.">
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full rounded-xl pl-9 pr-3 py-3 text-sm outline-none cursor-not-allowed"
                      style={{ background: "#F8FAFC", border: `1px solid ${CLR_BORDER}`, color: "#94A3B8" }}
                    />
                  </div>
                </Field>
                <Field label="Nomor Telepon">
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }} />
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="081234567890"
                      className="w-full rounded-xl pl-9 pr-3 py-3 text-sm outline-none transition placeholder:text-[#94A3B8]"
                      style={inputBase}
                      onFocus={onFocusBlue}
                      onBlur={onBlurDefault}
                    />
                  </div>
                </Field>
                <Field label="Alamat">
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3.5" style={{ color: "#94A3B8" }} />
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      rows={3}
                      placeholder="Masukkan alamat lengkap"
                      className="w-full rounded-xl pl-9 pr-3 py-3 text-sm outline-none transition placeholder:text-[#94A3B8] resize-none"
                      style={inputBase}
                      onFocus={onFocusBlue}
                      onBlur={onBlurDefault}
                    />
                  </div>
                </Field>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl p-3.5 font-semibold text-white text-sm transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 10px 24px -10px rgba(37,99,235,0.5)" }}
                >
                  <Save size={16} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </SectionCard>

            {/* ══════════ Sertifikat teknisi ══════════ */}
            {isTechnician && (
              <SectionCard icon={<FileCheck2 size={16} />} title="Sertifikat Teknisi">
                {certificationUrl ? (
                  <div
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl mb-4"
                    style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.12)" }}>
                        <FileCheck2 size={16} style={{ color: "#10B981" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold" style={{ color: "#10B981" }}>
                          Sertifikat sudah diunggah
                        </p>
                        <p className="text-xs truncate" style={{ color: "#94A3B8" }}>
                          {certificationUrl}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await import("../../services/api").then((m) =>
                            m.default.get("/v1/technician/certification", { responseType: "blob" })
                          );
                          const url = URL.createObjectURL(res.data);
                          window.open(url, "_blank", "noreferrer");
                          setTimeout(() => URL.revokeObjectURL(url), 60_000);
                        } catch {
                          toast.error("Gagal membuka sertifikat.");
                        }
                      }}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap flex-shrink-0"
                      style={{ background: "rgba(16,185,129,0.14)", color: "#059669" }}
                    >
                      Lihat
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 mb-4 p-3.5 rounded-xl" style={{ background: "rgba(234,158,12,0.06)", border: "1px solid rgba(234,158,12,0.2)" }}>
                    <UploadCloud size={16} style={{ color: "#CA8A04" }} />
                    <p className="text-sm" style={{ color: "#92660A" }}>Belum ada sertifikat yang diunggah.</p>
                  </div>
                )}
                <label
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition cursor-pointer hover:brightness-105 active:scale-95"
                  style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY }}
                >
                  <UploadCloud size={15} />
                  <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleCertificationUpload} />
                  {certUploading ? "Mengupload..." : "Upload Sertifikat"}
                </label>
              </SectionCard>
            )}

            {/* ══════════ Ubah password ══════════ */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "#FFFFFF", border: `1px solid ${CLR_BORDER_LT}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
            >
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(37,99,235,0.08)", color: CLR_ACCENT }}>
                    <Lock size={16} />
                  </span>
                  <span className="font-semibold text-sm" style={{ fontFamily: FONT_DISPLAY, color: CLR_TEXT }}>Ubah Password</span>
                </div>
                <ChevronDown size={16} style={{ color: CLR_SUBTLE, transform: showPw ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              {showPw && (
                <form onSubmit={handleChangePassword} className="mt-5 space-y-4 pt-5" style={{ borderTop: `1px solid ${CLR_BORDER_LT}` }}>
                  <Field label="Password Lama">
                    <input
                      type="password"
                      value={pwForm.current_password}
                      onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                      required
                      className="w-full rounded-xl p-3 text-sm outline-none transition"
                      style={inputBase}
                      onFocus={onFocusBlue}
                      onBlur={onBlurDefault}
                    />
                  </Field>
                  <Field label="Password Baru">
                    <input
                      type="password"
                      value={pwForm.password}
                      onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full rounded-xl p-3 text-sm outline-none transition"
                      style={inputBase}
                      onFocus={onFocusBlue}
                      onBlur={onBlurDefault}
                    />
                  </Field>
                  <Field label="Konfirmasi Password">
                    <input
                      type="password"
                      value={pwForm.password_confirmation}
                      onChange={(e) => setPwForm({ ...pwForm, password_confirmation: e.target.value })}
                      required
                      minLength={8}
                      className="w-full rounded-xl p-3 text-sm outline-none transition"
                      style={inputBase}
                      onFocus={onFocusBlue}
                      onBlur={onBlurDefault}
                    />
                  </Field>
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="w-full rounded-xl p-3.5 font-semibold text-white text-sm transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
                    style={{ background: GRAD_PRIMARY, fontFamily: FONT_DISPLAY, boxShadow: "0 10px 24px -10px rgba(37,99,235,0.5)" }}
                  >
                    {pwLoading ? "Mengubah..." : "Ubah Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}