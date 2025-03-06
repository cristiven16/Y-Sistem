// src/pages/Cajas/CajaForm.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { Caja, CajaPayload } from "./cajasTypes";
import { crearCaja, actualizarCaja } from "../../api/cajasAPI";
import { getSucursales } from "../../api/sucursalesAPI";
import { useAuth } from "../../hooks/useAuth";

// Interfaz de Sucursal mínima, para el select
interface SucursalItem {
  id: number;
  nombre: string;
  // ...
}

Modal.setAppElement("#root");

interface CajaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  caja?: Caja | null;         // en modo edición
  organizacionId: number;     // de tu user, etc.
}

const initialForm: CajaPayload = {
  organizacion_id: 0,  // se seteará luego
  sucursal_id: 0,
  nombre: "",
  estado: true,
  vigencia: true,
};

const CajaForm: React.FC<CajaFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  caja,
  organizacionId,
}) => {
  const [formData, setFormData] = useState<CajaPayload>(initialForm);
  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [loading, setLoading] = useState(false); // Estado para deshabilitar el botón

  // Cargar sucursales al abrir
  useEffect(() => {
    if (isOpen) {
      loadSucursales(organizacionId);

      if (caja) {
        // Modo edición
        setFormData({
          organizacion_id: caja.organizacion_id,
          sucursal_id: caja.sucursal_id,
          nombre: caja.nombre,
          estado: caja.estado,
          vigencia: caja.vigencia,
        });
      } else {
        // Modo creación
        setFormData({
          ...initialForm,
          organizacion_id: organizacionId,
        });
      }
    }
  }, [isOpen, caja, organizacionId]);

  async function loadSucursales(orgId: number) {
    try {
      const data = await getSucursales(orgId);
      // Ajusta si tu backend no devuelve { data } sino un array directamente:
      setSucursales(data.data || data); 
    } catch (err) {
      console.error("Error al cargar sucursales:", err);
      toast.error("No se pudieron cargar las sucursales.");
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, type, checked, value } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "sucursal_id") {
      setFormData((prev) => ({ ...prev, sucursal_id: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Evitar doble envío por seguridad
    if (loading) return;

    setLoading(true);
    try {
      if (caja && caja.id) {
        // Editar
        await actualizarCaja(organizacionId, caja.id, formData);
        toast.success("Caja actualizada con éxito.");
      } else {
        // Crear
        await crearCaja(organizacionId, formData);
        toast.success("Caja creada con éxito.");
      }
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar la caja:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Ocurrió un error al guardar la caja.");
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
      contentLabel="CajaForm"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <h2 className="text-xl font-bold mb-4">
        {caja ? "Editar Caja" : "Crear Caja"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NOMBRE */}
        <div>
          <label className="label" htmlFor="nombre">
            Nombre de la Caja
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

        {/* SELECCIÓN DE SUCURSAL */}
        <div>
          <label className="label" htmlFor="sucursal_id">
            Sucursal
          </label>
          <select
            id="sucursal_id"
            name="sucursal_id"
            className="input-field"
            value={formData.sucursal_id}
            onChange={handleChange}
          >
            <option value="0">-- Seleccione --</option>
            {sucursales.map((suc) => (
              <option key={suc.id} value={suc.id}>
                {suc.nombre}
              </option>
            ))}
          </select>
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
            ¿Caja activa?
          </label>
        </div>

        {/* VIGENCIA */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="vigencia"
            name="vigencia"
            checked={formData.vigencia}
            onChange={handleChange}
          />
          <label htmlFor="vigencia" className="label">
            ¿Vigente?
          </label>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading} // opcional, desactivar "Cancelar" también
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary bg-blue-600"
            disabled={loading}  // Deshabilitar mientras loading === true
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CajaForm;
