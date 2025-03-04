// src/api/axiosConfig.ts

import axios from "axios";

console.log("MODE =>", import.meta.env.MODE);
const isDev = import.meta.env.MODE === "development";

/**
 * Si NO vas a usar proxy en modo dev, 
 * simplemente apunta directamente a tu BACKEND URL.
 * Por ejemplo, en desarrollo: "http://127.0.0.1:8000"
 */
const devBaseURL = "http://127.0.0.1:8000";

/**
 * En producción, podemos usar la variable de entorno VITE_API_URL
 * o en su defecto un fallback "http://127.0.0.1:8000"
 */
const prodBaseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Escoge la baseURL según el modo
 * (si quieres que en desarrollo igualmente apunte a http://127.0.0.1:8000 
 *  en lugar de usar "/api" con proxy).
 */
const baseURL = isDev ? devBaseURL : prodBaseURL;

console.log("axiosConfig -> baseURL:", baseURL);

// Crear instancia de axios
const apiClient = axios.create({
  baseURL,
});

// Interceptor para inyectar el token "access_token" en cada request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    console.log("Interceptor => token:", token, " URL:", config.url);

    if (token) {
      // Aseguramos que config.headers exista
      config.headers = config.headers ?? {};
      // Ponemos la cabecera Authorization
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
