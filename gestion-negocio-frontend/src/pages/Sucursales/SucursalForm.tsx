// src/pages/Sucursales/SucursalForm.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { Sucursal, SucursalPayload, Departamento, Ciudad } from "./sucursalesTypes";
import { crearSucursal, actualizarSucursalParcial } from "../../api/sucursalesAPI";
import { obtenerDepartamentos, obtenerCiudades } from "../../api/ubicacionesAPI";

Modal.setAppElement("#root");

interface SucursalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;  // para recargar la lista en la página
  sucursal?: Sucursal | null;
  organizacionId: number; // para el payload organizacion_id y la ruta
}

const initialForm: SucursalPayload = {
  organizacion_id: 1, // Se ajusta dinámicamente luego
  nombre: "",
  pais: "COLOMBIA",
  departamento_id: null,
  ciudad_id: null,
  direccion: "",
  telefonos: "",
  prefijo_transacciones: "",
  sucursal_principal: false,
  activa: true,
};

const SucursalForm: React.FC<SucursalFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sucursal,
  organizacionId,
}) => {
  const [formData, setFormData] = useState<SucursalPayload>(initialForm);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [departamentosCargados, setDepartamentosCargados] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Cargamos deptos si no se han cargado antes
      if (!departamentosCargados) {
        loadDepartamentos();
      }

      if (sucursal) {
        // Modo edición: tomamos datos de la sucursal existente
        setFormData({
          organizacion_id: sucursal.organizacion_id,
          nombre: sucursal.nombre,
          pais: sucursal.pais || "COLOMBIA",
          departamento_id: sucursal.departamento_id ?? null,
          ciudad_id: sucursal.ciudad_id ?? null,
          direccion: sucursal.direccion || "",
          telefonos: sucursal.telefonos || "",
          prefijo_transacciones: sucursal.prefijo_transacciones || "",
          sucursal_principal: sucursal.sucursal_principal,
          activa: sucursal.activa,
        });
      } else {
        // Modo creación
        setFormData({
          ...initialForm,
          organizacion_id: organizacionId,
        });
      }
    }
  }, [isOpen, sucursal, organizacionId]);

  // Cada vez que cambia formData.departamento_id => cargamos ciudades
  useEffect(() => {
    if (formData.departamento_id) {
      loadCiudades(formData.departamento_id);
    } else {
      setCiudades([]);
      setFormData((prev) => ({ ...prev, ciudad_id: null }));
    }
  }, [formData.departamento_id]);

  async function loadDepartamentos() {
    try {
      const data = await obtenerDepartamentos();
      setDepartamentos(data);
      setDepartamentosCargados(true);
    } catch (error) {
      console.error("Error al cargar departamentos", error);
      toast.error("Error al cargar departamentos");
    }
  }

  async function loadCiudades(departamentoId: number) {
    try {
      const data = await obtenerCiudades(departamentoId);
      setCiudades(data);
    } catch (error) {
      console.error("Error al cargar ciudades", error);
      toast.error("Error al cargar ciudades");
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "departamento_id" || name === "ciudad_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (sucursal && sucursal.id) {
        // Actualizar sucursal existente
        await actualizarSucursalParcial(organizacionId, sucursal.id, formData);
        toast.success("Sucursal actualizada");
      } else {
        // Crear nueva sucursal
        await crearSucursal(organizacionId, formData);
        toast.success("Sucursal creada");
      }
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar sucursal:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Ocurrió un error al guardar la sucursal.");
      }
    }
  }

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="modal-overlay"
      className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-xl w-full max-h-[80vh] overflow-auto"
      contentLabel="Sucursal"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <h2 className="text-xl font-bold mb-4">
        {sucursal ? "Editar Sucursal" : "Crear Sucursal"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* NOMBRE */}
        <div>
          <label className="label" htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            className="input-field"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        {/* PAIS */}
        <div>
          <label className="label" htmlFor="pais">
            País
          </label>
          <input
            id="pais"
            name="pais"
            type="text"
            className="input-field"
            value={formData.pais ?? ""}
            onChange={handleChange}
          />
        </div>

        {/* DEPARTAMENTO */}
        <div>
          <label className="label" htmlFor="departamento_id">
            Departamento
          </label>
          <select
            id="departamento_id"
            name="departamento_id"
            className="input-field"
            onChange={handleChange}
            value={formData.departamento_id ?? ""}
          >
            <option value="">-- Seleccione --</option>
            {departamentos.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* CIUDAD */}
        <div>
          <label className="label" htmlFor="ciudad_id">
            Ciudad
          </label>
          <select
            id="ciudad_id"
            name="ciudad_id"
            className="input-field"
            onChange={handleChange}
            value={formData.ciudad_id ?? ""}
            disabled={!formData.departamento_id}
          >
            <option value="">-- Seleccione --</option>
            {ciudades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* DIRECCIÓN */}
        <div>
          <label className="label" htmlFor="direccion">
            Dirección
          </label>
          <input
            id="direccion"
            name="direccion"
            type="text"
            className="input-field"
            value={formData.direccion ?? ""}
            onChange={handleChange}
          />
        </div>

        {/* TELÉFONOS */}
        <div>
          <label className="label" htmlFor="telefonos">
            Teléfonos
          </label>
          <input
            id="telefonos"
            name="telefonos"
            type="text"
            className="input-field"
            value={formData.telefonos ?? ""}
            onChange={handleChange}
          />
        </div>

        {/* PREFIJO TRANSACCIONES */}
        <div>
          <label className="label" htmlFor="prefijo_transacciones">
            Prefijo Transacciones
          </label>
          <input
            id="prefijo_transacciones"
            name="prefijo_transacciones"
            type="text"
            className="input-field"
            value={formData.prefijo_transacciones ?? ""}
            onChange={handleChange}
          />
        </div>

        {/* SUCURSAL PRINCIPAL (checkbox) */}
        <div className="flex items-center gap-2">
          <input
            id="sucursal_principal"
            name="sucursal_principal"
            type="checkbox"
            checked={formData.sucursal_principal}
            onChange={handleChange}
          />
          <label className="label" htmlFor="sucursal_principal">
            ¿Sucursal Principal?
          </label>
        </div>

        {/* ACTIVA (checkbox) */}
        <div className="flex items-center gap-2">
          <input
            id="activa"
            name="activa"
            type="checkbox"
            checked={formData.activa}
            onChange={handleChange}
          />
          <label className="label" htmlFor="activa">
            ¿Activa?
          </label>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-2 mt-4">
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

export default SucursalForm;
