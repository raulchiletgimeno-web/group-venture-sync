import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register custom service worker for push notifications + auto-update
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/custom-sw.js")
      .then((registration) => {
        // Poll for SW updates every 60 seconds
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 1000);
      })
      .catch((err) => {
        console.warn("SW registration failed:", err);
      });
  });

  // Auto-reload when a new SW takes control
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
