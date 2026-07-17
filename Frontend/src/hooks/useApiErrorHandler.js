import { useEffect } from "react";
import { toast } from "../components/ui/Toast";

/**
 * Hook to listen for API error events dispatched by the axios interceptor
 * and show toast notifications. Mount once in App.jsx or layout.
 */
export default function useApiErrorHandler() {
  useEffect(() => {
    const handler = (e) => {
      const { status, message } = e.detail || {};
      switch (status) {
        case 403:
          toast.error(message || "Anda tidak memiliki akses.");
          break;
        case 422:
          toast.error(message || "Data tidak valid.");
          break;
        case 500:
        case 502:
        case 503:
          toast.error(message || "Terjadi kesalahan pada server.");
          break;
        default:
          toast.error(message || "Terjadi kesalahan.");
      }
    };

    window.addEventListener("api:error", handler);
    return () => window.removeEventListener("api:error", handler);
  }, []);
}
