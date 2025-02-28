import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import {
  crearEmpleado,
  actualizarEmpleado,
  obtenerTiposDocumento,
} from "../../api/empleadosAPI";
import { obtenerDepartamentos, obtenerCiudades } from "../../api/ubicacionesAPI";

// Tipos
import {
  Empleado,
  EmpleadoPayload,
  TipoDocumento,
  Departamento,
  Ciudad,
} from "./empleadosTypes";

Modal.setAppElement("#root");

function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const initialForm: EmpleadoPayload = {
  // No uses ID=0 si tu backend no lo requiere
  id: undefined, 
  tipo_documento: undefined,
  numero_documento: "",
  nombre_razon_social: "",
  email: null,

  telefono1: "",
  telefono2: "",
  celular: "",
  whatsapp: "",

  tipos_persona_id: 1,
  regimen_tributario_id: 5,
  moneda_principal_id: 1,
  actividad_economica_id: undefined,
  forma_pago_id: 1,
  retencion_id: undefined,
  
  departamento: undefined,
  ciudad: undefined,
  direccion: "",
  sucursal_id: 1,
  observacion: "",
  cargo: "",
  fecha_nacimiento: "",
  fecha_ingreso: "",
  activo: true,
  es_vendedor: false,
};

interface EmpleadoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empleado?: Empleado | null;
}

const EmpleadoForm: React.FC<EmpleadoFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  empleado,
}) => {
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [departamentosCargados, setDepartamentosCargados] = useState(false);

  const [formData, setFormData] = useState<EmpleadoPayload>(initialForm);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarCatalogos();
      if (empleado) {
        // EDIT
        setFormData({
          id: empleado.id,
          tipo_documento: empleado.tipo_documento || undefined,
          numero_documento: empleado.numero_documento,
          nombre_razon_social: empleado.nombre_razon_social,
          email: empleado.email ?? null,
          departamento: empleado.departamento,
          ciudad: empleado.ciudad,
          direccion: empleado.direccion,
          telefono1: empleado.telefono1 || "",
          telefono2: empleado.telefono2 || "",
          celular: empleado.celular || "",
          whatsapp: empleado.whatsapp || "",
          tipos_persona_id: empleado.tipos_persona_id,
          regimen_tributario_id: empleado.regimen_tributario_id,
          moneda_principal_id: empleado.moneda_principal_id,
          actividad_economica_id: empleado.actividad_economica_id ?? undefined,
          forma_pago_id: empleado.forma_pago_id,
          retencion_id: empleado.retencion_id ?? undefined,
          sucursal_id: empleado.sucursal_id,
          observacion: empleado.observacion || "",
          cargo: empleado.cargo || "",
          fecha_nacimiento: empleado.fecha_nacimiento || "",
          fecha_ingreso: empleado.fecha_ingreso || "",
          activo: empleado.activo,
          es_vendedor: empleado.es_vendedor,
        });
      } else {
        // CREATE
        setFormData(initialForm);
      }
    }
  }, [isOpen, empleado]);

  const cargarCatalogos = async () => {
    try {
      const tdRes = await obtenerTiposDocumento();
      setTiposDocumento(tdRes);
    } catch (error) {
      console.error("Error al cargar catálogos:", error);
      toast.error("No se pudieron cargar los catálogos.");
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, checked } = e.target;

    // Filtrar dígitos
    if (["numero_documento","telefono1","telefono2","celular","whatsapp"].includes(name)) {
      const soloDigitos = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: soloDigitos }));
      return;
    }

    // Checkboxes
    if (name === "activo" || name === "es_vendedor") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // IDs numéricos
    if ([
      "tipos_persona_id",
      "regimen_tributario_id",
      "moneda_principal_id",
      "actividad_economica_id",
      "forma_pago_id",
      "retencion_id",
      "sucursal_id",
    ].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
      return;
    }

    // Email => null
    if (name === "email") {
      setFormData((prev) => ({
        ...prev,
        email: value.trim() === "" ? null : value,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoDocumentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const found = tiposDocumento.find((td) => td.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      tipo_documento: found,
    }));
  };

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const dep = departamentos.find((d) => d.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      departamento: dep,
      ciudad: undefined,
    }));
  };

  const handleCiudadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const c = ciudades.find((ci) => ci.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      ciudad: c,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones mínimas
    if (!formData.numero_documento || !formData.nombre_razon_social) {
      toast.error("Documento y Nombre son obligatorios.");
      return;
    }
    if (!formData.telefono1 && !formData.telefono2 && !formData.celular && !formData.whatsapp) {
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

    // Armar payload
    const payload = {
      // si tu backend ignora "id" en POST, no pasa nada si lo envías
      id: formData.id ?? 0, 
      tipo_documento: formData.tipo_documento
        ? {
            id: formData.tipo_documento.id,
            nombre: formData.tipo_documento.nombre,
            abreviatura: formData.tipo_documento.abreviatura,
          }
        : null,
      numero_documento: formData.numero_documento,
      nombre_razon_social: formData.nombre_razon_social,
      email: formData.email,
      telefono1: formData.telefono1,
      telefono2: formData.telefono2,
      celular: formData.celular,
      whatsapp: formData.whatsapp,
      tipos_persona_id: formData.tipos_persona_id ?? 1,
      regimen_tributario_id: formData.regimen_tributario_id ?? 5,
      moneda_principal_id: formData.moneda_principal_id ?? 1,
      actividad_economica_id: formData.actividad_economica_id ?? null,
      forma_pago_id: formData.forma_pago_id ?? 1,
      retencion_id: formData.retencion_id ?? null,
      departamento: formData.departamento
        ? {
            id: formData.departamento.id,
            nombre: formData.departamento.nombre,
          }
        : null,
      ciudad: formData.ciudad
        ? {
            id: formData.ciudad.id,
            nombre: formData.ciudad.nombre,
          }
        : null,
      direccion: formData.direccion,
      sucursal_id: formData.sucursal_id ?? 1,
      observacion: formData.observacion,
      cargo: formData.cargo,
      fecha_nacimiento: formData.fecha_nacimiento || null,
      fecha_ingreso: formData.fecha_ingreso || null,
      activo: formData.activo,
      es_vendedor: formData.es_vendedor,
    };

    try {
      if (empleado && empleado.id) {
        await actualizarEmpleado(empleado.id, payload);
        toast.success("Empleado actualizado con éxito.");
      } else {
        await crearEmpleado(payload);
        toast.success("Empleado creado con éxito.");
      }

      setFormData(initialForm);
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar empleado:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Ocurrió un error al guardar el empleado.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="modal"
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-5xl"
      contentLabel="Crear/Editar Empleado"
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
        {empleado && empleado.id ? "Editar Empleado" : "Registrar Empleado"}
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
              type="text"
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
              type="text"
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
              type="text"
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
              type="text"
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
              type="text"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp || ""}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="flex flex-col gap-2 justify-center mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              <span className="ml-2">Activo</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                id="es_vendedor"
                name="es_vendedor"
                checked={formData.es_vendedor}
                onChange={handleChange}
              />
              <span className="ml-2">¿Es vendedor?</span>
            </label>
          </div>
        </div>

        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn-secondary"
          >
            {showAdvanced ? "Ocultar detalles opcionales" : "Mostrar detalles opcionales"}
          </button>
        </div>

        {showAdvanced && (
          <div className="border p-3 rounded-lg mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="cargo">
                  Cargo
                </label>
                <input
                  type="text"
                  id="cargo"
                  name="cargo"
                  value={formData.cargo || ""}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label" htmlFor="fecha_nacimiento">
                  Fecha Nacimiento
                </label>
                <input
                  type="date"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento || ""}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label" htmlFor="fecha_ingreso">
                  Fecha Ingreso
                </label>
                <input
                  type="date"
                  id="fecha_ingreso"
                  name="fecha_ingreso"
                  value={formData.fecha_ingreso || ""}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="col-span-1 sm:col-span-2">
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

export default EmpleadoForm;
