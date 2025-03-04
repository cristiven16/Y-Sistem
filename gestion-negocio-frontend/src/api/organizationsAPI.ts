// src/api/organizationsAPI.ts

import apiClient from "./axiosConfig";
import { Organization, OrganizationPayload } from "../pages/Organizations/organizationTypes";

/**
 * Obtener datos de la organización por ID.
 */
export async function getOrganization(orgId: number): Promise<Organization> {
  const resp = await apiClient.get(`/organizations/${orgId}`);
  return resp.data;
}

/**
 * Actualizar todos los campos de la organización (PUT /organizations/{id}).
 * En tu backend, el endpoint se llama "update_organization" que espera un OrganizacionCreate.
 */
export async function updateOrganization(
  orgId: number,
  payload: Partial<OrganizationPayload>
): Promise<Organization> {
  const resp = await apiClient.put(`/organizations/${orgId}`, payload);
  return resp.data;
}
