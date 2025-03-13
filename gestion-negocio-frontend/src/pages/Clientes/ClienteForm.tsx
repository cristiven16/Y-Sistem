// src/pages/Clientes/ClienteForm.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";

// APIs de Clientes
import {
  crearCliente,
  actualizarCliente,
  obtenerTiposDocumento,
  obtenerRegimenesTributarios,
  obtenerTiposPersona,
  obtenerMonedas,
  obtenerTarifasPrecios,
  obtenerFormasPago,
  obtenerSucursales,
  obtenerActividadesEconomicas,
  obtenerRetenciones,
  obtenerTiposMarketing,
} from "../../api/clientesAPI";

// APIs de ubicaciones (departamentos, ciudades)
import { obtenerDepartamentos, obtenerCiudades } from "../../api/ubicacionesAPI";

// API Empleados: filtrar es_vendedor=true
import { obtenerEmpleadosVendedores } from "../../api/empleadosAPI";

// Tipos
import {
  ClientePayload,
  TipoDocumento,
  Departamento,
  Ciudad,
  Cliente // si deseas
} from "./clientesTypes";

Modal.setAppElement("#root");

/**
 * Minimiza
 */
function capitalizeWords(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Valor inicial del formulario
const initialFormData: ClientePayload = {
  tipo_documento: undefined,
  numero_documento: "",
  nombre_razon_social: "",
  email: undefined,

  departamento: undefined,
  ciudad: undefined,
  direccion: "",

  telefono1: "",
  telefono2: "",
  celular: "",
  whatsapp: "",

  tipos_persona_id: 1,
  regimen_tributario_id: 5,
  moneda_principal_id: 1,
  tarifa_precios_id: 1,
  forma_pago_id: 1,
  permitir_venta: true,
  descuento: 0,
  cupo_credito: 0,
  organizacion_id: 1,

  sucursal_id: 1,
  vendedor_id: undefined,
  pagina_web: "",
  actividad_economica_id: undefined,
  retencion_id: undefined,
  tipo_marketing_id: undefined,
  ruta_logistica_id: undefined,
  observacion: "",
};

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cliente?: Cliente | undefined; // o tu interfaz "Cliente"
}

const ClienteForm: React.FC<ClienteFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  cliente,
}) => {
  // Catálogos
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [regimenes, setRegimenes] = useState<any[]>([]);
  const [tiposPersona, setTiposPersona] = useState<any[]>([]);
  const [monedas, setMonedas] = useState<any[]>([]);
  const [tarifas, setTarifas] = useState<any[]>([]);
  const [formasPago, setFormasPago] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [actividadesEco, setActividadesEco] = useState<any[]>([]);
  const [retenciones, setRetenciones] = useState<any[]>([]);
  const [tiposMarketing, setTiposMarketing] = useState<any[]>([]);

  // Ubicaciones
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [departamentosCargados, setDepartamentosCargados] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ClientePayload>(initialFormData);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarCatalogos();

      if (cliente) {
        // Modo edición: mapear cliente => formData
        setFormData({
          organizacion_id: cliente.organizacion_id,
          tipo_documento: {
            id: cliente.tipo_documento_id,
            nombre: "Desconocido", // Si no tienes data relacional
            abreviatura: "N/A"
          },
          numero_documento: cliente.numero_documento,
          nombre_razon_social: cliente.nombre_razon_social,
          email: cliente.email || undefined,

          departamento: cliente.departamento
            ? { id: cliente.departamento_id, nombre: cliente.departamento.nombre }
            : undefined,
          ciudad: cliente.ciudad
            ? { id: cliente.ciudad_id, nombre: cliente.ciudad.nombre }
            : undefined,
          direccion: cliente.direccion,

          telefono1: cliente.telefono1 || "",
          telefono2: cliente.telefono2 || "",
          celular: cliente.celular || "",
          whatsapp: cliente.whatsapp || "",

          tipos_persona_id: cliente.tipos_persona_id,
          regimen_tributario_id: cliente.regimen_tributario_id,
          moneda_principal_id: cliente.moneda_principal_id,
          tarifa_precios_id: cliente.tarifa_precios_id,
          forma_pago_id: cliente.forma_pago_id,
          permitir_venta: cliente.permitir_venta,
          descuento: cliente.descuento,
          cupo_credito: cliente.cupo_credito,
          sucursal_id: cliente.sucursal_id || 1,
          vendedor_id: cliente.vendedor_id || undefined,
          pagina_web: cliente.pagina_web || "",
          actividad_economica_id: cliente.actividad_economica_id,
          retencion_id: cliente.retencion_id,
          tipo_marketing_id: cliente.tipo_marketing_id,
          ruta_logistica_id: cliente.ruta_logistica_id,
          observacion: cliente.observacion || "",
        });
      } else {
        // Modo creación
        setFormData(initialFormData);
      }
    }
  }, [isOpen, cliente]);

  const cargarCatalogos = async () => {
    try {
      const [
        tdRes,
        regRes,
        tpRes,
        moRes,
        tfRes,
        fpRes,
        sucRes,
        actEcoRes,
        retRes,
        tmRes,
      ] = await Promise.all([
        obtenerTiposDocumento(),
        obtenerRegimenesTributarios(),
        obtenerTiposPersona(),
        obtenerMonedas(),
        obtenerTarifasPrecios(),
        obtenerFormasPago(),
        obtenerSucursales(),
        obtenerActividadesEconomicas(),
        obtenerRetenciones(),
        obtenerTiposMarketing(),
      ]);

      setTiposDocumento(tdRes);
      setRegimenes(regRes);
      setTiposPersona(tpRes);
      setMonedas(moRes);
      setTarifas(tfRes);
      setFormasPago(fpRes);
      setSucursales(sucRes);
      setActividadesEco(actEcoRes);
      setRetenciones(retRes);
      setTiposMarketing(tmRes);

      // Empleados vendedores
      const vendedoresEmpleados = await obtenerEmpleadosVendedores();
      setVendedores(vendedoresEmpleados);
    } catch (error) {
      console.error("Error al cargar catálogos:", error);
      toast.error("No se pudieron cargar algunos catálogos.");
    }
  };

  const handleFocusDepartamento = async () => {
    if (!departamentosCargados) {
      try {
        const data = await obtenerDepartamentos();
        setDepartamentos(data);
        setDepartamentosCargados(true);
      } catch (error) {
        toast.error("Error al cargar departamentos");
      }
    }
  };

  useEffect(() => {
    if (formData.departamento?.id) {
      cargarCiudades(formData.departamento.id);
    } else {
      setCiudades([]);
      setFormData((prev) => ({ ...prev, ciudad: undefined }));
    }
  }, [formData.departamento?.id]);

  const cargarCiudades = async (depId: number) => {
    try {
      const data = await obtenerCiudades(depId);
      setCiudades(data);
    } catch (error) {
      toast.error("Error al cargar ciudades");
    }
  };

  // Manejo de cambios (para inputs y selects)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Filtrar dígitos
    if (["numero_documento","telefono1","telefono2","celular","whatsapp"].includes(name)) {
      const soloDigitos = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: soloDigitos }));
      return;
    }

    // Campos numéricos (IDs)
    if ([
      "tipos_persona_id",
      "regimen_tributario_id",
      "moneda_principal_id",
      "tarifa_precios_id",
      "forma_pago_id",
      "sucursal_id",
      "actividad_economica_id",
      "retencion_id",
      "tipo_marketing_id",
      "ruta_logistica_id",
      "organizacion_id",
    ].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
      return;
    }

    // Email => undefined
    if (name === "email") {
      setFormData((prev) => ({
        ...prev,
        email: value.trim() === "" ? undefined : value,
      }));
      return;
    }

    // Vendedor
    if (name === "vendedor_id") {
      setFormData((prev) => ({
        ...prev,
        vendedor_id: value === "" ? undefined : Number(value),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Nuevo handler para el checkbox
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { checked } = e.target;
    setFormData((prev) => ({ ...prev, permitir_venta: checked }));
  };

  // Select para tipo_documento
  const handleTipoDocumentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const found = tiposDocumento.find((td) => td.id === selectedId);
    setFormData((prev) => ({ ...prev, tipo_documento: found }));
  };

  // Select para departamento
  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const dep = departamentos.find((d) => d.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      departamento: dep,
      ciudad: undefined
    }));
  };

  // Select para ciudad
  const handleCiudadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const c = ciudades.find((ci) => ci.id === selectedId);
    setFormData((prev) => ({ ...prev, ciudad: c }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando formData:", formData);

    // Validaciones mínimas
    if (!formData.numero_documento || !formData.nombre_razon_social) {
      toast.error("Documento y Nombre son obligatorios.");
      return;
    }
    if (
      !formData.telefono1 &&
      !formData.telefono2 &&
      !formData.celular &&
      !formData.whatsapp
    ) {
      toast.error("Debe ingresar al menos un teléfono o celular.");
      return;
    }
    if (!formData.departamento) {
      toast.error("Debe seleccionar un departamento.");
      return;
    }
    if (!formData.ciudad) {
      toast.error("Debe seleccionar una ciudad.");
      return;
    }
    if (!formData.tipo_documento?.id) {
      toast.error("Debe seleccionar el tipo de documento.");
      return;
    }
    if (!formData.organizacion_id) {
      toast.error("Falta asignar la organización del cliente.");
      return;
    }

    // Aplanar el payload
    const payload = {
      tipo_documento_id: formData.tipo_documento.id,
      organizacion_id: formData.organizacion_id,
      numero_documento: formData.numero_documento,
      nombre_razon_social: formData.nombre_razon_social,
      email: formData.email,
      pagina_web: formData.pagina_web,

      departamento_id: formData.departamento.id,
      ciudad_id: formData.ciudad.id,
      direccion: formData.direccion,

      telefono1: formData.telefono1,
      telefono2: formData.telefono2,
      celular: formData.celular,
      whatsapp: formData.whatsapp,

      tipos_persona_id: formData.tipos_persona_id,
      regimen_tributario_id: formData.regimen_tributario_id,
      moneda_principal_id: formData.moneda_principal_id,
      tarifa_precios_id: formData.tarifa_precios_id,
      forma_pago_id: formData.forma_pago_id,
      permitir_venta: formData.permitir_venta,
      descuento: Number(formData.descuento),
      cupo_credito: Number(formData.cupo_credito),

      sucursal_id: formData.sucursal_id,
      vendedor_id: formData.vendedor_id,
      actividad_economica_id: formData.actividad_economica_id,
      retencion_id: formData.retencion_id,
      tipo_marketing_id: formData.tipo_marketing_id,
      ruta_logistica_id: formData.ruta_logistica_id,
      observacion: formData.observacion,
    };

    try {
      if (cliente && cliente.id) {
        // Actualizar => PATCH
        await actualizarCliente(cliente.id, payload);
        toast.success("Cliente actualizado con éxito.");
      } else {
        // Crear => POST
        await crearCliente(payload);
        toast.success("Cliente creado con éxito.");
      }

      setFormData(initialFormData);
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar cliente:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Ocurrió un error al guardar el cliente.");
      }
    }
  };

  if (!isOpen) return undefined;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="modal"
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-5xl"
      contentLabel="Crear/Editar Cliente"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4">
        {cliente && cliente.id ? "Editar Cliente" : "Registrar Cliente"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Fila 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label" htmlFor="tipo_documento">
              Tipo de Documento
            </label>
            <select
              id="tipo_documento"
              value={formData.tipo_documento?.id || ""}
              onChange={handleTipoDocumentoChange}
              className="input-field"
            >
              <option value="">-- Seleccione --</option>
              {tiposDocumento.map((td) => (
                <option key={td.id} value={td.id}>
                  {td.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="numero_documento">
              Número de Documento
            </label>
            <input
              type="number"
              id="numero_documento"
              name="numero_documento"
              value={formData.numero_documento}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="nombre_razon_social">
              Nombre / Razón Social
            </label>
            <input
              type="text"
              id="nombre_razon_social"
              name="nombre_razon_social"
              value={formData.nombre_razon_social}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Fila 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email ?? ""}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="label" htmlFor="departamento">
              Departamento
            </label>
            <select
              id="departamento"
              onFocus={handleFocusDepartamento}
              onChange={handleDepartamentoChange}
              value={formData.departamento?.id || ""}
              className="input-field"
            >
              <option value="">-- Seleccione --</option>
              {departamentos.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {capitalizeWords(dep.nombre)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ciudad">
              Ciudad
            </label>
            <select
              id="ciudad"
              onChange={handleCiudadChange}
              value={formData.ciudad?.id || ""}
              className="input-field"
              disabled={!formData.departamento}
            >
              <option value="">-- Seleccione --</option>
              {ciudades.map((c) => (
                <option key={c.id} value={c.id}>
                  {capitalizeWords(c.nombre)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label" htmlFor="direccion">
              Dirección
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="telefono1">
              Teléfono 1
            </label>
            <input
              type="number"
              id="telefono1"
              name="telefono1"
              value={formData.telefono1 || ""}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="label" htmlFor="telefono2">
              Teléfono 2
            </label>
            <input
              type="number"
              id="telefono2"
              name="telefono2"
              value={formData.telefono2 || ""}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Fila 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label" htmlFor="celular">
              Celular
            </label>
            <input
              type="number"
              id="celular"
              name="celular"
              value={formData.celular || ""}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="label" htmlFor="whatsapp">
              WhatsApp
            </label>
            <input
              type="number"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp || ""}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="hidden lg:block" />
        </div>

        {/* Botón para ver campos avanzados */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-secondary"
          >
            {showAdvanced
              ? "Ocultar detalles opcionales"
              : "Mostrar detalles opcionales"}
          </button>
        </div>

        {showAdvanced && (
          <div className="border p-3 rounded-lg mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tipo de Persona */}
              <div>
                <label className="label" htmlFor="tipos_persona_id">
                  Tipo de Persona
                </label>
                <select
                  id="tipos_persona_id"
                  name="tipos_persona_id"
                  value={formData.tipos_persona_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  {tiposPersona.map((tp) => (
                    <option key={tp.id} value={tp.id}>
                      {tp.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Régimen Tributario */}
              <div>
                <label className="label" htmlFor="regimen_tributario_id">
                  Régimen Tributario
                </label>
                <select
                  id="regimen_tributario_id"
                  name="regimen_tributario_id"
                  value={formData.regimen_tributario_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  {regimenes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Moneda principal */}
              <div>
                <label className="label" htmlFor="moneda_principal_id">
                  Moneda Principal
                </label>
                <select
                  id="moneda_principal_id"
                  name="moneda_principal_id"
                  value={formData.moneda_principal_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  {monedas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tarifa Precios */}
              <div>
                <label className="label" htmlFor="tarifa_precios_id">
                  Tarifa de Precios
                </label>
                <select
                  id="tarifa_precios_id"
                  name="tarifa_precios_id"
                  value={formData.tarifa_precios_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  {tarifas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Forma de Pago */}
              <div>
                <label className="label" htmlFor="forma_pago_id">
                  Forma de Pago
                </label>
                <select
                  id="forma_pago_id"
                  name="forma_pago_id"
                  value={formData.forma_pago_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  {formasPago.map((fp) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actividad Económica */}
              <div>
                <label className="label" htmlFor="actividad_economica_id">
                  Actividad Económica
                </label>
                <select
                  id="actividad_economica_id"
                  name="actividad_economica_id"
                  value={formData.actividad_economica_id || ""}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">No especificado</option>
                  {actividadesEco.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Retención */}
              <div>
                <label className="label" htmlFor="retencion_id">
                  Retención
                </label>
                <select
                  id="retencion_id"
                  name="retencion_id"
                  value={formData.retencion_id || ""}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">No aplica</option>
                  {retenciones.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo Marketing */}
              <div>
                <label className="label" htmlFor="tipo_marketing_id">
                  Tipo de Marketing
                </label>
                <select
                  id="tipo_marketing_id"
                  name="tipo_marketing_id"
                  value={formData.tipo_marketing_id || ""}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">N/A</option>
                  {tiposMarketing.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {tm.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ruta Logística */}
              <div>
                <label className="label" htmlFor="ruta_logistica_id">
                  Ruta Logística
                </label>
                <input
                  type="number"
                  id="ruta_logistica_id"
                  name="ruta_logistica_id"
                  value={formData.ruta_logistica_id || ""}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* Sucursal */}
              <div>
                <label className="label" htmlFor="sucursal_id">
                  Sucursal
                </label>
                <select
                  id="sucursal_id"
                  name="sucursal_id"
                  value={formData.sucursal_id || 1}
                  onChange={handleChange}
                  className="input-field"
                >
                  {sucursales.map((suc: any) => (
                    <option key={suc.id} value={suc.id}>
                      {suc.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendedor */}
              <div>
                <label className="label" htmlFor="vendedor_id">
                  Vendedor
                </label>
                <select
                  id="vendedor_id"
                  name="vendedor_id"
                  value={formData.vendedor_id ?? ""}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">-- Sin asignar --</option>
                  {vendedores.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre_razon_social || v.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Página web */}
              <div>
                <label className="label" htmlFor="pagina_web">
                  Página Web
                </label>
                <input
                  type="text"
                  id="pagina_web"
                  name="pagina_web"
                  value={formData.pagina_web || ""}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* Descuento */}
              <div>
                <label className="label" htmlFor="descuento">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="descuento"
                  name="descuento"
                  value={formData.descuento}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* Cupo de Crédito */}
              <div>
                <label className="label" htmlFor="cupo_credito">
                  Cupo de Crédito
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="cupo_credito"
                  name="cupo_credito"
                  value={formData.cupo_credito}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {/* Permitir Venta (checkbox) */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="permitir_venta"
                  name="permitir_venta"
                  checked={formData.permitir_venta}
                  onChange={handleCheckboxChange} // <--- nuevo handler
                />
                <label htmlFor="permitir_venta" className="label">
                  Permitir Venta
                </label>
              </div>

              {/* Observación */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <label className="label" htmlFor="observacion">
                  Observación
                </label>
                <textarea
                  id="observacion"
                  name="observacion"
                  value={formData.observacion || ""}
                  onChange={handleChange}
                  className="input-field"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        <div className="modal-actions flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary bg-blue-600">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClienteForm;
