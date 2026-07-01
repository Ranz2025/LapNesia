import api from "./api";

export const getOwnerDashboard = (period = "monthly") =>
  api.get(`/v1/owner/dashboard?period=${period}`).then(r => r.data);
