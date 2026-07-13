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

/**
 * Upload satu atau beberapa foto bukti inspeksi.
 * @param {string|number} reportId - ID laporan inspeksi
 * @param {File[]} files - Array file gambar
 * @param {string[]} captions - Array caption (opsional, sesuai urutan files)
 * @param {function} onProgress - Callback (percent: number) untuk progress bar
 */
export const uploadInspectionPhotos = async (reportId, files, captions = [], onProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("photos[]", file));
  captions.forEach((cap) => formData.append("captions[]", cap ?? ""));

  const res = await api.post(`/v1/inspection-reports/${reportId}/photos`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
  return res.data;
};

/**
 * Hapus satu foto bukti inspeksi.
 * @param {string|number} reportId
 * @param {string|number} photoId
 */
export const deleteInspectionPhoto = async (reportId, photoId) => {
  const res = await api.delete(`/v1/inspection-reports/${reportId}/photos/${photoId}`);
  return res.data;
};
