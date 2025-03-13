// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Si no necesitas configuración extra en server, puedes omitirlo:
  // server: {
  //   // Sin proxy, sin nada adicional
  // },
});
