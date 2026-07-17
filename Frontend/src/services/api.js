import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 401:
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
        break;

      case 403: {
        const msg403 = data?.message || "Anda tidak memiliki akses untuk melakukan aksi ini.";
        if (typeof window !== "undefined" && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent("api:error", { detail: { status: 403, message: msg403 } }));
        }
        console.warn("[403 Forbidden]", msg403);
        break;
      }

      case 422: {
        const msg422 = data?.message || "Data yang dikirim tidak valid.";
        const errors = data?.errors || {};
        if (typeof window !== "undefined" && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent("api:error", { detail: { status: 422, message: msg422, errors } }));
        }
        console.warn("[422 Validation]", msg422, errors);
        break;
      }

      case 500:
      case 502:
      case 503: {
        const msg500 = "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
        if (typeof window !== "undefined" && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent("api:error", { detail: { status, message: msg500 } }));
        }
        console.error(`[${status} Server Error]`, data?.message || msg500);
        break;
      }

      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default api;
