import api from "./api";

export const getTechnicians = async () => (await api.get("/v1/technicians")).data;
export const getTechnicianById = async (id) => (await api.get(`/v1/technicians/${id}`)).data;
export const getTechnicianAvailability = async (id) => (await api.get(`/v1/technicians/${id}/availability`)).data;
export const createInspectionJob = async (data) => (await api.post("/v1/inspection-jobs", data)).data;
export const getInspectionJob = async (id) => (await api.get(`/v1/inspection-jobs/${id}`)).data;
export const getInspectionReport = async (id) => (await api.get(`/v1/inspection-reports/${id}`)).data;
export const payInspectionJob = async (jobId) => (await api.post(`/v1/inspection-jobs/${jobId}/pay`)).data;
export const getInspectionPayment = async (id) => (await api.get(`/v1/inspection-payments/${id}`)).data;
export const rateInspectionJob = async (jobId, data) => (await api.post(`/v1/inspection-jobs/${jobId}/rating`, data)).data;
export const acceptInspectionJob = async (jobId) => (await api.put(`/v1/inspection-jobs/${jobId}/accept`)).data;
export const rejectInspectionJob = async (jobId) => (await api.put(`/v1/inspection-jobs/${jobId}/reject`)).data;
export const cancelInspectionJob = async (jobId) => (await api.put(`/v1/inspection-jobs/${jobId}/cancel`)).data;
export const completeInspectionJob = async (jobId) => (await api.put(`/v1/inspection-jobs/${jobId}/complete`)).data;
export const setInspectionSchedule = async (jobId, data) => (await api.put(`/v1/inspection-jobs/${jobId}/set-schedule`, data)).data;
