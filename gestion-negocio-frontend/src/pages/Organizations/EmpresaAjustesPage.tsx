// src/pages/Organizations/EmpresaAjustesPage.tsx
import React, { useEffect, useState } from "react";
import { getOrganization, updateOrganization } from "../../api/organizationsAPI";
import { Organization, OrganizationPayload } from "./organizationTypes";
import { useParams } from "react-router-dom"; // si usas react-router
import { toast } from "react-toastify";

/**
 * Página: Ajustes de la Empresa (Organización).
 * Muestra la información de la org actual (por ID) y permite actualizar.
 */
const EmpresaAjustesPage: React.FC = () => {
  const { orgId } = useParams(); 
  // o si tu ID lo obtienes de otro lado, ajusta la lógica.

  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Para editar
  const [formData, setFormData] = useState<OrganizationPayload>({
    nombre_fiscal: "",
    obligado_contabilidad: false,
    email_principal: "",
    dias_dudoso_recaudo: 0,
    recibir_copia_email_documentos_electronicos: false,
  });

  // Para la sección "avanzada"
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Cargar la org al montar
  useEffect(() => {
    if (!orgId) return; // o si no te da un ID
    loadOrganization(Number(orgId));
  }, [orgId]);

  async function loadOrganization(id: number) {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrganization(id);
      setOrg(data);
      // Llenamos formData con lo que sea editable
      setFormData({
        tipo_documento_id: data.tipo_documento_id ?? null,
        numero_documento: data.numero_documento ?? null,
        dv: data.dv ?? null,
        nombre_fiscal: data.nombre_fiscal,
        nombre_comercial: data.nombre_comercial ?? null,
        nombre_corto: data.nombre_corto ?? null,
        obligado_contabilidad: data.obligado_contabilidad,
        email_principal: data.email_principal,
        email_alertas_facturacion: data.email_alertas_facturacion ?? null,
        email_alertas_soporte: data.email_alertas_soporte ?? null,
        celular_whatsapp: data.celular_whatsapp ?? null,
        pagina_web: data.pagina_web ?? null,
        encabezado_personalizado: data.encabezado_personalizado ?? null,
        dias_dudoso_recaudo: data.dias_dudoso_recaudo,
        recibir_copia_email_documentos_electronicos: data.recibir_copia_email_documentos_electronicos,
        politica_garantias: data.politica_garantias ?? null,
      });
    } catch (err) {
      console.error("Error cargando org:", err);
      setError("No se pudo cargar la información de la empresa.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, checked, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    try {
      const updated = await updateOrganization(Number(orgId), formData);
      setOrg(updated);
      toast.success("Datos actualizados correctamente");
    } catch (error: any) {
      console.error("Error al actualizar org:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("No se pudo actualizar la empresa.");
      }
    }
  }

  if (!orgId) {
    return <div>No se definió orgId en la ruta</div>;
  }

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!org) {
    return <div>No se encontró la organización</div>;
  }

  // Formatear plan
  function formatPlanSummary(org: Organization) {
    const inicio = org.fecha_inicio_plan
      ? new Date(org.fecha_inicio_plan).toLocaleDateString()
      : "N/A";
    const fin = org.fecha_fin_plan
      ? new Date(org.fecha_fin_plan).toLocaleDateString()
      : "N/A";

    return (
      <div className="bg-gray-100 p-3 rounded mb-4">
        <h3 className="font-semibold text-gray-700 mb-2">Resumen del Plan</h3>
        <p className="text-sm">
          <strong>ID Plan:</strong> {org.plan_id ?? "N/A"} <br />
          <strong>Fecha Inicio:</strong> {inicio} <br />
          <strong>Fecha Fin:</strong> {fin} <br />
          <strong>Trial Activo:</strong>{" "}
          {org.trial_activo ? "Sí" : "No"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ajustes de la Empresa</h1>

      {/* Resumen plan */}
      {formatPlanSummary(org)}

      <form onSubmit={handleSave} className="bg-white p-4 rounded shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campos básicos */}
          <div>
            <label className="label" htmlFor="nombre_fiscal">
              Nombre Fiscal
            </label>
            <input
              id="nombre_fiscal"
              name="nombre_fiscal"
              type="text"
              className="input-field"
              value={formData.nombre_fiscal}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="nombre_comercial">
              Nombre Comercial
            </label>
            <input
              id="nombre_comercial"
              name="nombre_comercial"
              type="text"
              className="input-field"
              value={formData.nombre_comercial ?? ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="nombre_corto">
              Nombre Corto
            </label>
            <input
              id="nombre_corto"
              name="nombre_corto"
              type="text"
              className="input-field"
              value={formData.nombre_corto ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              id="obligado_contabilidad"
              name="obligado_contabilidad"
              type="checkbox"
              checked={formData.obligado_contabilidad}
              onChange={handleChange}
            />
            <label className="label" htmlFor="obligado_contabilidad">
              ¿Obligado a Contabilidad?
            </label>
          </div>

          <div>
            <label className="label" htmlFor="email_principal">
              Email Principal
            </label>
            <input
              id="email_principal"
              name="email_principal"
              type="email"
              className="input-field"
              value={formData.email_principal}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="celular_whatsapp">
              Celular / WhatsApp
            </label>
            <input
              id="celular_whatsapp"
              name="celular_whatsapp"
              type="text"
              className="input-field"
              value={formData.celular_whatsapp ?? ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="pagina_web">
              Página Web
            </label>
            <input
              id="pagina_web"
              name="pagina_web"
              type="text"
              className="input-field"
              value={formData.pagina_web ?? ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="dias_dudoso_recaudo">
              Días Dudoso Recaudo
            </label>
            <input
              id="dias_dudoso_recaudo"
              name="dias_dudoso_recaudo"
              type="number"
              className="input-field"
              value={formData.dias_dudoso_recaudo}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              id="recibir_copia_email_documentos_electronicos"
              name="recibir_copia_email_documentos_electronicos"
              type="checkbox"
              checked={formData.recibir_copia_email_documentos_electronicos}
              onChange={handleChange}
            />
            <label
              className="label"
              htmlFor="recibir_copia_email_documentos_electronicos"
            >
              Recibir copia de Documentos Electrónicos
            </label>
          </div>
        </div>

        {/* Botón para mostrar campos avanzados */}
        <div className="my-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Ocultar Ajustes Avanzados" : "Mostrar Ajustes Avanzados"}
          </button>
        </div>

        {showAdvanced && (
          <div className="border p-3 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo Documento / NIT, DV */}
              <div>
                <label className="label" htmlFor="tipo_documento_id">
                  Tipo Documento ID
                </label>
                <input
                  id="tipo_documento_id"
                  name="tipo_documento_id"
                  type="number"
                  className="input-field"
                  value={formData.tipo_documento_id ?? ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label" htmlFor="numero_documento">
                  Número Documento
                </label>
                <input
                  id="numero_documento"
                  name="numero_documento"
                  type="text"
                  className="input-field"
                  value={formData.numero_documento ?? ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label" htmlFor="dv">
                  DV
                </label>
                <input
                  id="dv"
                  name="dv"
                  type="text"
                  className="input-field"
                  value={formData.dv ?? ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label" htmlFor="email_alertas_facturacion">
                  Email Alertas Facturación
                </label>
                <input
                  id="email_alertas_facturacion"
                  name="email_alertas_facturacion"
                  type="email"
                  className="input-field"
                  value={formData.email_alertas_facturacion ?? ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label" htmlFor="email_alertas_soporte">
                  Email Alertas Soporte
                </label>
                <input
                  id="email_alertas_soporte"
                  name="email_alertas_soporte"
                  type="email"
                  className="input-field"
                  value={formData.email_alertas_soporte ?? ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label" htmlFor="politica_garantias">
                  Política de Garantías
                </label>
                <textarea
                  id="politica_garantias"
                  name="politica_garantias"
                  className="input-field"
                  rows={3}
                  value={formData.politica_garantias ?? ""}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label" htmlFor="encabezado_personalizado">
                  Encabezado Personalizado
                </label>
                <textarea
                  id="encabezado_personalizado"
                  name="encabezado_personalizado"
                  className="input-field"
                  rows={2}
                  value={formData.encabezado_personalizado ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button type="submit" className="btn-primary bg-blue-600">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmpresaAjustesPage;
