// src/pages/TiendasVirtuales/TiendaVirtualForm.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { TiendaVirtual, TiendaVirtualPayload } from "./tiendasvirtualesTypes";
import {
  crearTiendaVirtual,
  actualizarTiendaVirtual,
} from "../../api/tiendasvirtualesAPI";

Modal.setAppElement("#root");

interface TiendaVirtualFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organizacionId: number;
  tienda?: TiendaVirtual | undefined;
}

const initialForm: TiendaVirtualPayload = {
  organizacion_id: 0,
  plataforma: "",
  nombre: "",
  url: "",
  centro_costo_id: undefined,
  estado: true,
};

const TiendaVirtualForm: React.FC<TiendaVirtualFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  organizacionId,
  tienda,
}) => {
  const [formData, setFormData] = useState<TiendaVirtualPayload>(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (tienda) {
        // Modo edición
        setFormData({
          organizacion_id: tienda.organizacion_id,
          plataforma: tienda.plataforma || "",
          nombre: tienda.nombre,
          url: tienda.url || "",
          centro_costo_id: tienda.centro_costo_id,
          estado: tienda.estado,
        });
      } else {
        // Modo creación
        setFormData({
          ...initialForm,
          organizacion_id: organizacionId,
        });
      }
    }
  }, [isOpen, tienda, organizacionId]);

  // Handler principal (no-checkbox)
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    // Centro de costo => number | undefined
    if (name === "centro_costo_id") {
      setFormData((prev) => ({
        ...prev,
        centro_costo_id: value === "" ? undefined : Number(value),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Handler exclusivo para checkbox "estado"
  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { checked } = e.target;
    setFormData((prev) => ({ ...prev, estado: checked }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (tienda && tienda.id) {
        await actualizarTiendaVirtual(organizacionId, tienda.id, formData);
        toast.success("Tienda Virtual actualizada con éxito.");
      } else {
        await crearTiendaVirtual(organizacionId, formData);
        toast.success("Tienda Virtual creada con éxito.");
      }
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar la Tienda Virtual:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Ocurrió un error al guardar la Tienda Virtual.");
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
      contentLabel="TiendaVirtualForm"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <h2 className="text-xl font-bold mb-4">
        {tienda ? "Editar Tienda Virtual" : "Crear Tienda Virtual"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="plataforma">
            Plataforma
          </label>
          <input
            type="text"
            id="plataforma"
            name="plataforma"
            className="input-field"
            value={formData.plataforma}
            onChange={handleChange}
          />
        </div>

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

        <div>
          <label className="label" htmlFor="url">
            URL
          </label>
          <input
            type="text"
            id="url"
            name="url"
            className="input-field"
            value={formData.url}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label" htmlFor="centro_costo_id">
            Centro de Costo (opcional)
          </label>
          <input
            type="number"
            id="centro_costo_id"
            name="centro_costo_id"
            className="input-field"
            value={formData.centro_costo_id ?? ""}
            onChange={handleChange}
            placeholder="ID del centro de costo"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="estado"
            name="estado"
            checked={formData.estado}
            onChange={handleCheckboxChange} // <--- nuevo handler
          />
          <label htmlFor="estado" className="label">
            ¿Activa?
          </label>
        </div>

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

export default TiendaVirtualForm;
