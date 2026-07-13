import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Reset scroll ke atas setiap kali route berubah.
 * Pasang sekali di dalam <BrowserRouter> di AppRoutes.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
