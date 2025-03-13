// src/pages/Bodegas/BodegaForm.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { Bodega, BodegaPayload } from "./bodegasTypes";
import { crearBodega, actualizarBodega } from "../../api/bodegasAPI";
import { getSucursales } from "../../api/sucursalesAPI";
import { Sucursal } from "../Sucursales/sucursalesTypes";

Modal.setAppElement("#root");

interface BodegaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
  organizacionId: number;
  bodega?: Bodega; // Usamos Opción #2 => bodega?: Bodega;
}

const initialForm: BodegaPayload = {
  organizacion_id: 1,
  sucursal_id: 0,
  nombre: "",
  bodega_por_defecto: false,
  estado: true,
};

const BodegaForm: React.FC<BodegaFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  organizacionId,
  bodega,
}) => {
  const [formData, setFormData] = useState<BodegaPayload>(initialForm);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSucursales();

      if (bodega) {
        // Edit mode
        setFormData({
          organizacion_id: organizacionId,
          sucursal_id: bodega.sucursal_id,
          nombre: bodega.nombre,
          bodega_por_defecto: bodega.bodega_por_defecto,
          estado: bodega.estado,
        });
      } else {
        // Create mode
        setFormData({
          ...initialForm,
          organizacion_id: organizacionId,
        });
      }
    }
  }, [isOpen, bodega, organizacionId]);

  async function loadSucursales() {
    try {
      const resp = await getSucursales(organizacionId, "", 1, 9999);
      setSucursales(resp.data);
    } catch (err) {
      console.error("Error al cargar sucursales:", err);
      toast.error("No se pudieron cargar las sucursales.");
    }
  }

  // --- AQUÍ ESTÁ EL CAMBIO CRÍTICO:
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, type, value } = e.target;

    if (type === "checkbox") {
      // Forzamos a TS a tratarlo como HTMLInputElement
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "sucursal_id") {
      setFormData((prev) => ({ ...prev, sucursal_id: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return; 
    setLoading(true);

    try {
      if (bodega && bodega.id) {
        // Actualizar
        await actualizarBodega(organizacionId, bodega.id, formData);
        toast.success("Bodega actualizada con éxito.");
      } else {
        // Crear
        await crearBodega(organizacionId, formData);
        toast.success("Bodega creada con éxito.");
      }
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar la bodega:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Ocurrió un error al guardar la bodega.");
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
      contentLabel="Bodega"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <h2 className="text-xl font-bold mb-4">
        {bodega ? "Editar Bodega" : "Crear Bodega"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
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

        {/* Seleccionar Sucursal */}
        <div>
          <label className="label" htmlFor="sucursal_id">
            Sucursal
          </label>
          <select
            id="sucursal_id"
            name="sucursal_id"
            className="input-field"
            onChange={handleChange}
            value={formData.sucursal_id}
          >
            <option value={0}>-- Seleccione Sucursal --</option>
            {sucursales.map((suc) => (
              <option key={suc.id} value={suc.id}>
                {suc.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="bodega_por_defecto"
            name="bodega_por_defecto"
            type="checkbox"
            checked={formData.bodega_por_defecto}
            onChange={handleChange}
          />
          <label className="label" htmlFor="bodega_por_defecto">
            ¿Bodega por defecto?
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="estado"
            name="estado"
            type="checkbox"
            checked={formData.estado}
            onChange={handleChange}
          />
          <label className="label" htmlFor="estado">
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

export default BodegaForm;
