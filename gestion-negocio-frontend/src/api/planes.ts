// src/api/planes.ts
import apiClient from "./axiosConfig";

/**
 * NOTA:
 * - Suponemos que tu backend está en http://127.0.0.1:8000
 *   y tu `axiosConfig.ts` ya lo maneja (ya sea con un proxy
 *   en vite.config.ts o con baseURL).
 * - De igual manera, si tu interceptor no está funcionando,
 *   aquí forzamos manualmente la inyección de Authorization.
 */

// 1) Obtener la lista de planes
export async function fetchPlanes() {
    const token = localStorage.getItem("access_token");
    console.log("fetchPlanes => token:", token); // (1) Log para verificar
    if (!token) throw new Error("No hay token en localStorage");
  
    const resp = await apiClient.get("/planes", {
      headers: {
        Authorization: `Bearer ${token}`, // (2) forzamos el header
      },
    });
    console.log("fetchPlanes => respuesta:", resp);
    return resp.data;
  }

// 2) Crear un nuevo plan
export async function createPlan(payload: any) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No se encontró 'access_token' en localStorage");
  }

  const resp = await apiClient.post("/planes", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return resp.data;
}

// 3) Actualizar plan existente
export async function updatePlan(planId: number, payload: any) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No se encontró 'access_token' en localStorage");
  }

  const resp = await apiClient.put(`/planes/${planId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return resp.data;
}

// 4) Eliminar plan
export async function deletePlan(planId: number) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No se encontró 'access_token' en localStorage");
  }

  const resp = await apiClient.delete(`/planes/${planId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return resp.data;
}
