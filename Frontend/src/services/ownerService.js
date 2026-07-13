import api from "./api";

export const getOwnerDashboard = (period = "monthly") =>
  api.get(`/v1/owner/dashboard?period=${period}`).then(r => r.data);

/**
 * Setup Laravel Echo untuk real-time updates
 * Dipanggil sekali di App.jsx atau main.jsx
 */
export const setupLaravelEcho = () => {
  if (!window.Echo) {
    // Jika Laravel Echo belum tersedia, setup dengan Pusher atau fallback
    // Untuk development bisa gunakan log atau null driver
    console.warn('Laravel Echo belum tersedia. Real-time updates tidak aktif.');
    return false;
  }
  return true;
};
