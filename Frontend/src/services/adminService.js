import api from "./api";

export const getPendingTechnicians = (status = "pending") =>
  api.get(`/v1/admin/technicians?status=${status}`).then(r => r.data);

export const approveTechnician = (id) =>
  api.put(`/v1/admin/technicians/${id}/approve`).then(r => r.data);

export const rejectTechnician = (id, reason) =>
  api.put(`/v1/admin/technicians/${id}/reject`, { reason }).then(r => r.data);

export const getAllUsers = (params = {}) =>
  api.get("/v1/admin/users", { params }).then(r => r.data);

export const getTechnicianCertification = (id) =>
  api.get(`/v1/admin/technicians/${id}/certification`, { responseType: "blob" }).then(r => r.data);
