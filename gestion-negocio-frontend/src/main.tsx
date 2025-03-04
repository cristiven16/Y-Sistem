import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./hooks/useAuth"; // nuestro provider
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </AuthProvider>
  </StrictMode>
);
