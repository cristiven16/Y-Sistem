// src/pages/NumeracionTransaccion/NumTransaccionForm.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import {
  NumTransaccion,
  NumTransaccionPayload,
} from "./numeracionTransaccionTypes";
import {
  crearNumTransaccion,
  actualizarNumTransaccion,
} from "../../api/numtransaccionAPI";

Modal.setAppElement("#root");

interface NumTransaccionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Para recargar la lista en la página
  organizacionId: number;
  numeracion?: NumTransaccion | undefined; // Modo edición si no es undefined
}

const initialForm: NumTransaccionPayload = {
  organizacion_id: 0,
  tipo_transaccion: "",
  nombre_personalizado: "",
  titulo_transaccion: "",
  mostrar_info_numeracion: true,
  separador_prefijo: "",
  titulo_numeracion: "",
  longitud_numeracion: 0,
  numeracion_por_defecto: false,
  numero_resolucion: "",
  fecha_expedicion: "",
  fecha_vencimiento: "",
  prefijo: "",
  numeracion_inicial: 1,
  numeracion_final: 100,
  numeracion_siguiente: 1,
  total_maximo_por_transaccion: 0,
  transaccion_electronica: false,
};

const NumTransaccionForm: React.FC<NumTransaccionFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  organizacionId,
  numeracion,
}) => {
  const [formData, setFormData] =
    useState<NumTransaccionPayload>(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (numeracion) {
        // Modo edición
        setFormData({
          organizacion_id: numeracion.organizacion_id,
          tipo_transaccion: numeracion.tipo_transaccion || "",
          nombre_personalizado: numeracion.nombre_personalizado,
          titulo_transaccion: numeracion.titulo_transaccion,
          mostrar_info_numeracion: numeracion.mostrar_info_numeracion,
          separador_prefijo: numeracion.separador_prefijo || "",
          titulo_numeracion: numeracion.titulo_numeracion || "",
          longitud_numeracion: numeracion.longitud_numeracion || 0,
          numeracion_por_defecto: numeracion.numeracion_por_defecto,
          numero_resolucion: numeracion.numero_resolucion || "",
          fecha_expedicion: numeracion.fecha_expedicion || "",
          fecha_vencimiento: numeracion.fecha_vencimiento || "",
          prefijo: numeracion.prefijo || "",
          numeracion_inicial: numeracion.numeracion_inicial,
          numeracion_final: numeracion.numeracion_final,
          numeracion_siguiente: numeracion.numeracion_siguiente,
          total_maximo_por_transaccion:
            numeracion.total_maximo_por_transaccion || 0,
          transaccion_electronica: numeracion.transaccion_electronica,
        });
      } else {
        // Modo creación
        setFormData({
          ...initialForm,
          organizacion_id: organizacionId,
        });
      }
    }
  }, [isOpen, numeracion, organizacionId]);

  // Handler principal (inputs/selects)
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    // Campos numéricos
    if (
      [
        "longitud_numeracion",
        "numeracion_inicial",
        "numeracion_final",
        "numeracion_siguiente",
        "total_maximo_por_transaccion",
      ].includes(name)
    ) {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  // Handler exclusivo para checkboxes
  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // Evitar doble clic

    setLoading(true);
    try {
      // Validaciones mínimas
      if (!formData.nombre_personalizado) {
        toast.error("El nombre personalizado es obligatorio.");
        return;
      }
      if (!formData.titulo_transaccion) {
        toast.error("El título de transacción es obligatorio.");
        return;
      }
      if (
        formData.numeracion_inicial < 1 ||
        formData.numeracion_final < formData.numeracion_inicial
      ) {
        toast.error("La numeración final debe ser mayor que la inicial.");
        return;
      }
      if (
        formData.numeracion_siguiente < formData.numeracion_inicial ||
        formData.numeracion_siguiente > formData.numeracion_final
      ) {
        toast.error(
          "El siguiente número debe estar entre la numeración inicial y final."
        );
        return;
      }

      if (numeracion && numeracion.id) {
        // Editar
        await actualizarNumTransaccion(
          organizacionId,
          numeracion.id,
          formData
        );
        toast.success("Numeración actualizada con éxito.");
      } else {
        // Crear
        await crearNumTransaccion(organizacionId, formData);
        toast.success("Numeración creada con éxito.");
      }
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar la numeración:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Ocurrió un error al guardar la numeración.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return undefined;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="modal-overlay"
      className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-xl w-full max-h-[80vh] overflow-auto"
      contentLabel="NumTransaccionForm"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <h2 className="text-xl font-bold mb-4">
        {numeracion ? "Editar Numeración" : "Crear Numeración"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NOMBRE PERSONALIZADO */}
        <div>
          <label className="label" htmlFor="nombre_personalizado">
            Nombre Personalizado
          </label>
          <input
            type="text"
            id="nombre_personalizado"
            name="nombre_personalizado"
            className="input-field"
            value={formData.nombre_personalizado}
            onChange={handleChange}
            required
          />
        </div>

        {/* TÍTULO DE LA TRANSACCIÓN */}
        <div>
          <label className="label" htmlFor="titulo_transaccion">
            Título de Transacción
          </label>
          <input
            type="text"
            id="titulo_transaccion"
            name="titulo_transaccion"
            className="input-field"
            value={formData.titulo_transaccion}
            onChange={handleChange}
            required
          />
        </div>

        {/* PREFIJO + SEPARADOR */}
        <div className="flex gap-2">
          <div>
            <label className="label" htmlFor="prefijo">
              Prefijo
            </label>
            <input
              type="text"
              id="prefijo"
              name="prefijo"
              className="input-field"
              value={formData.prefijo || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="label" htmlFor="separador_prefijo">
              Separador
            </label>
            <input
              type="text"
              id="separador_prefijo"
              name="separador_prefijo"
              className="input-field"
              value={formData.separador_prefijo || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* NUMERACIÓN INICIAL / FINAL / SIGUIENTE */}
        <div className="flex gap-2">
          <div>
            <label className="label" htmlFor="numeracion_inicial">
              Nro. Inicial
            </label>
            <input
              type="number"
              id="numeracion_inicial"
              name="numeracion_inicial"
              className="input-field"
              value={formData.numeracion_inicial}
              onChange={handleChange}
              min={1}
            />
          </div>
          <div>
            <label className="label" htmlFor="numeracion_final">
              Nro. Final
            </label>
            <input
              type="number"
              id="numeracion_final"
              name="numeracion_final"
              className="input-field"
              value={formData.numeracion_final}
              onChange={handleChange}
              min={1}
            />
          </div>
          <div>
            <label className="label" htmlFor="numeracion_siguiente">
              Siguiente
            </label>
            <input
              type="number"
              id="numeracion_siguiente"
              name="numeracion_siguiente"
              className="input-field"
              value={formData.numeracion_siguiente}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ¿POR DEFECTO? / ¿MOSTRAR INFO? */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="numeracion_por_defecto"
            name="numeracion_por_defecto"
            checked={formData.numeracion_por_defecto}
            onChange={handleCheckboxChange} // <--- nuevo handler
          />
          <label htmlFor="numeracion_por_defecto" className="label">
            ¿Por defecto?
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="mostrar_info_numeracion"
            name="mostrar_info_numeracion"
            checked={formData.mostrar_info_numeracion}
            onChange={handleCheckboxChange} // <--- nuevo handler
          />
          <label htmlFor="mostrar_info_numeracion" className="label">
            ¿Mostrar info de numeración?
          </label>
        </div>

        {/* FECHAS (RESOLUCIÓN) */}
        <div className="flex gap-2">
          <div>
            <label className="label" htmlFor="fecha_expedicion">
              F. Expedición
            </label>
            <input
              type="date"
              id="fecha_expedicion"
              name="fecha_expedicion"
              className="input-field"
              value={formData.fecha_expedicion || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="label" htmlFor="fecha_vencimiento">
              F. Vencimiento
            </label>
            <input
              type="date"
              id="fecha_vencimiento"
              name="fecha_vencimiento"
              className="input-field"
              value={formData.fecha_vencimiento || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* NÚMERO RESOLUCIÓN */}
        <div>
          <label className="label" htmlFor="numero_resolucion">
            Resolución
          </label>
          <input
            type="text"
            id="numero_resolucion"
            name="numero_resolucion"
            className="input-field"
            value={formData.numero_resolucion || ""}
            onChange={handleChange}
          />
        </div>

        {/* TÍTULO NRO, LONGITUD, ETC. */}
        <div className="flex gap-2">
          <div>
            <label className="label" htmlFor="titulo_numeracion">
              Título Numeración
            </label>
            <input
              type="text"
              id="titulo_numeracion"
              name="titulo_numeracion"
              className="input-field"
              value={formData.titulo_numeracion || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="label" htmlFor="longitud_numeracion">
              Longitud
            </label>
            <input
              type="number"
              id="longitud_numeracion"
              name="longitud_numeracion"
              className="input-field"
              value={formData.longitud_numeracion || 0}
              onChange={handleChange}
              min={0}
            />
          </div>
        </div>

        {/* TRANSACCIÓN ELECTRÓNICA */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="transaccion_electronica"
            name="transaccion_electronica"
            checked={formData.transaccion_electronica}
            onChange={handleCheckboxChange} // <--- nuevo handler
          />
          <label htmlFor="transaccion_electronica" className="label">
            ¿Es Transacción Electrónica?
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

export default NumTransaccionForm;
