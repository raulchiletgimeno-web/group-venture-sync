import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const isLovablePreview = window.location.hostname.includes("preview--");

if ("serviceWorker" in navigator) {
  if (isLovablePreview) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {});
        });
      });

      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => {
            caches.delete(key).catch(() => {});
          });
        });
      }
    });
  } else if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/custom-sw.js")
        .then((registration) => {
          setInterval(() => {
            registration.update().catch(() => {});
          }, 30 * 60 * 1000);
        })
        .catch((err) => {
          console.warn("SW registration failed:", err);
        });
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
