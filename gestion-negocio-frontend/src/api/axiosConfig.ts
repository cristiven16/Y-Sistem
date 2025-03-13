// src/api/axiosConfig.ts
import axios from "axios";

// Muestra en consola el modo (development/production) y la var VITE_API_URL
console.log("MODE =>", import.meta.env.MODE);
console.log("VITE_API_URL =>", import.meta.env.VITE_API_URL);

// Detecta si es "development" (cuando ejecutas `npm run dev`)
const isDev = import.meta.env.MODE === "development";

// URL para modo desarrollo
const devBaseURL = "http://127.0.0.1:8000";

// URL para producción (Cloud Run), leída desde la variable de entorno
// o un fallback a local si no estuviera definida
const prodBaseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Escoge la baseURL según sea dev o prod
const baseURL = isDev ? devBaseURL : prodBaseURL;

console.log("axiosConfig -> baseURL:", baseURL);

// Crear la instancia de axios con la baseURL adecuada
const apiClient = axios.create({
  baseURL,
});

// Interceptor para inyectar el token "access_token" en cada request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    console.log("Interceptor => token:", token, "URL:", config.url);

    if (token) {
      // Aseguramos que config.headers exista
      config.headers = config.headers ?? {};
      // Añadimos la cabecera Authorization
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
