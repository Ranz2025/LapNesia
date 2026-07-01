import api from "./api";

export const getProfile = () => api.get("/v1/profile").then(r => r.data);

export const updateProfile = (data) => api.put("/v1/profile", data).then(r => r.data);

export const uploadProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return api.post("/v1/profile/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);
};

export const changePassword = (data) => api.put("/v1/profile/password", data).then(r => r.data);

export const uploadCertification = (file) => {
  const formData = new FormData();
  formData.append("certificate", file);
  return api.post("/v1/profile/certification", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);
};

export const getAdminDashboard = () => api.get("/v1/admin/dashboard").then(r => r.data);

export const approveWithdrawal = (id) => api.put(`/v1/admin/withdrawals/${id}/approve`).then(r => r.data);

export const rejectWithdrawal = (id, reason) => api.put(`/v1/admin/withdrawals/${id}/reject`, { reason }).then(r => r.data);
