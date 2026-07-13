import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import ToastContainer from "./components/ui/Toast";

function App() {
  useEffect(() => {
    // Setup Laravel Echo untuk real-time updates
    const setupEcho = async () => {
      try {
        const Echo = (await import("laravel-echo")).default;
        const Pusher = (await import("pusher-js")).default;

        window.Echo = new Echo({
          broadcaster: "pusher",
          key: import.meta.env.VITE_PUSHER_APP_KEY || "local",
          cluster: import.meta.env.VITE_PUSHER_CLUSTER || "mt",
          forceTLS: import.meta.env.VITE_PUSHER_SCHEME === "https",
          wsHost: import.meta.env.VITE_PUSHER_HOST || window.location.hostname,
          wsPort: import.meta.env.VITE_PUSHER_PORT || 6001,
          wssPort: import.meta.env.VITE_PUSHER_PORT || 6001,
          encrypted: true,
          enabledTransports: ["ws", "wss"],
          disabledTransports: [],
          Pusher,
        });

        console.log("✓ Laravel Echo initialized for real-time updates");
      } catch (error) {
        console.warn("⚠ Real-time updates not available:", error.message);
        // Fallback: gunakan polling saja
      }
    };

    setupEcho();

    return () => {
      if (window.Echo) {
        window.Echo.disconnect();
      }
    };
  }, []);

  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
