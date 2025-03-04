// vite.config.ts
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => {
  // Cargamos las variables de entorno
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Opcional: si solo quieres proxy en modo dev
    server: {
      proxy: mode === "development" ? {
        "/api": {
          target: env.VITE_API_URL || "http://127.0.0.1:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      } : {},
    },
  };
});
