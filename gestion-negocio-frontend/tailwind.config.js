/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // Azul oscuro
        secondary: "#6366F1", // Azul claro
        accent: "#F59E0B", // Naranja
        background: "#F3F4F6", // Gris claro
        text: "#1F2937", // Negro grisáceo
        tableHeader: "#E5E7EB", // Gris claro para encabezados
      },
    },
  },
  plugins: [],
};
