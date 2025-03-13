// src/pages/CentroCostos/CentroCostoForm.tsx

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
 */
const initialForm: CentroCostoPayload = {
  organizacion_id: 0,
  codigo: "",
  nombre: "",
  nivel: null,        // "PRINCIPAL" | "SUBCENTRO" | null
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
          nivel: centro.nivel,       // ya es "PRINCIPAL" | "SUBCENTRO" | null
          padre_id: centro.padre_id,
          permite_ingresos: centro.permite_ingresos,
          estado: centro.estado,
        });
      } else {
        // Modo creación
        setFormData({
          ...initialForm,
          organizacion_id: organizacionId,
        });
      }
    }
  }, [isOpen, centro, organizacionId]);

  /**
   * Handler para inputs (type="text"|"number") y selects (nivel).
   */
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name === "padre_id") {
      // Convierte a number o null
      setFormData((prev) => ({
        ...prev,
        padre_id: value ? Number(value) : null,
      }));
    } else if (name === "nivel") {
      // Si el select está vacío => null, si no => "PRINCIPAL" | "SUBCENTRO"
      setFormData((prev) => ({
        ...prev,
        nivel: value === "" ? null : (value as "PRINCIPAL" | "SUBCENTRO"),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  /**
   * Handler exclusivo para checkboxes.
   */
  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  }

  /**
   * Al enviar el formulario, llamamos a crear o actualizar
   * usando EXACTAMENTE lo que está en formData (nivel como string).
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
            onChange={handleInputChange} // NO checkbox
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
            onChange={handleInputChange} // NO checkbox
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
            onChange={handleInputChange} // NO checkbox
          >
            <option value="">-- Seleccione --</option>
            <option value="PRINCIPAL">PRINCIPAL</option>
            <option value="SUBCENTRO">SUBCENTRO</option>
          </select>
        </div>

        {/* PADRE_ID (optional) */}
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
            onChange={handleInputChange} // NO checkbox
            placeholder="ID del centro de costo padre"
          />
        </div>

        {/* PERMITE_INGRESOS (checkbox) */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="permite_ingresos"
            name="permite_ingresos"
            checked={formData.permite_ingresos}
            onChange={handleCheckboxChange} // SÍ checkbox
          />
          <label htmlFor="permite_ingresos" className="label">
            ¿Permite Ingresos?
          </label>
        </div>

        {/* ESTADO (checkbox) */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="estado"
            name="estado"
            checked={formData.estado}
            onChange={handleCheckboxChange} // SÍ checkbox
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
