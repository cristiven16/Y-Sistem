// src/pages/CentrosCostos/CentroCostoForm.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { CentroCosto, CentroCostoPayload } from "./centrosCostosTypes";
import {
  crearCentroCosto,
  actualizarCentroCosto,
} from "../../api/centrocostosAPI";

Modal.setAppElement("#root");

interface CentroCostoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  centro?: CentroCosto | null; // Modo edición si hay un centro
  organizacionId: number;      // ID de la organización actual
}

/**
 * Valores iniciales para crear un nuevo centro de costo.
 * Observa que `nivel` se declara como `null` para indicar "no seleccionado".
 */
const initialForm: CentroCostoPayload = {
  organizacion_id: 0,
  codigo: "",
  nombre: "",
  nivel: null,             // <-- 'PRINCIPAL' | 'SUBCENTRO' | null
  padre_id: null,
  permite_ingresos: true,
  estado: true,
};

const CentroCostoForm: React.FC<CentroCostoFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  centro,
  organizacionId,
}) => {
  const [formData, setFormData] = useState<CentroCostoPayload>(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (centro) {
        // Modo edición: cargamos sus datos
        setFormData({
          organizacion_id: centro.organizacion_id,
          codigo: centro.codigo,
          nombre: centro.nombre,
          nivel: centro.nivel,      // puede ser "PRINCIPAL", "SUBCENTRO" o null
          padre_id: centro.padre_id,
          permite_ingresos: centro.permite_ingresos,
          estado: centro.estado,
        });
      } else {
        // Modo creación: reseteamos con organizacionId
        setFormData({
          ...initialForm,
          organizacion_id: organizacionId,
        });
      }
    }
  }, [isOpen, centro, organizacionId]);

  /**
   * Manejador de cambios en los inputs.
   * - `nivel` se maneja como <select>, con opción de "" -> null.
   * - `padre_id` es un número (o null).
   * - `permite_ingresos` y `estado` son checkboxes (boolean).
   */
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "padre_id") {
      setFormData((prev) => ({
        ...prev,
        padre_id: value ? Number(value) : null,
      }));
    } else if (name === "nivel") {
      // Si el select está vacío => null, si no => "PRINCIPAL" o "SUBCENTRO"
      setFormData((prev) => ({
        ...prev,
        nivel: value === "" ? null : (value as "PRINCIPAL" | "SUBCENTRO"),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  /**
   * Al enviar el formulario, llamamos a crear o actualizar según
   * si estamos en modo edición (centro con id) o creación.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (centro && centro.id) {
        // Editar
        await actualizarCentroCosto(organizacionId, centro.id, formData);
        toast.success("Centro de costo actualizado con éxito.");
      } else {
        // Crear
        await crearCentroCosto(organizacionId, formData);
        toast.success("Centro de costo creado con éxito.");
      }
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar centro de costo:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Ocurrió un error al guardar el centro de costo.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="modal-overlay"
      className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-xl w-full max-h-[80vh] overflow-auto"
      contentLabel="CentroCostoForm"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <h2 className="text-xl font-bold mb-4">
        {centro ? "Editar Centro de Costo" : "Crear Centro de Costo"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* CÓDIGO */}
        <div>
          <label className="label" htmlFor="codigo">
            Código
          </label>
          <input
            type="text"
            id="codigo"
            name="codigo"
            className="input-field"
            value={formData.codigo}
            onChange={handleChange}
            required
          />
        </div>

        {/* NOMBRE */}
        <div>
          <label className="label" htmlFor="nombre">
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            className="input-field"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        {/* NIVEL: "PRINCIPAL" | "SUBCENTRO" | null */}
        <div>
          <label className="label" htmlFor="nivel">
            Nivel (opcional)
          </label>
          <select
            id="nivel"
            name="nivel"
            className="input-field"
            value={formData.nivel ?? ""}
            onChange={handleChange}
          >
            <option value="">-- Seleccione --</option>
            <option value="PRINCIPAL">PRINCIPAL</option>
            <option value="SUBCENTRO">SUBCENTRO</option>
          </select>
        </div>

        {/* PADRE_ID */}
        <div>
          <label className="label" htmlFor="padre_id">
            ID del Padre (opcional)
          </label>
          <input
            type="number"
            id="padre_id"
            name="padre_id"
            className="input-field"
            value={formData.padre_id ?? ""}
            onChange={handleChange}
            placeholder="ID del centro de costo padre"
          />
        </div>

        {/* PERMITE_INGRESOS */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="permite_ingresos"
            name="permite_ingresos"
            checked={formData.permite_ingresos}
            onChange={handleChange}
          />
          <label htmlFor="permite_ingresos" className="label">
            ¿Permite Ingresos?
          </label>
        </div>

        {/* ESTADO */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="estado"
            name="estado"
            checked={formData.estado}
            onChange={handleChange}
          />
          <label htmlFor="estado" className="label">
            ¿Centro activo?
          </label>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary bg-blue-600"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CentroCostoForm;
