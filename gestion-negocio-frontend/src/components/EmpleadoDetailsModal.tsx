// src/components/EmpleadoDetailsModal.tsx
import React from "react";
import Modal from "react-modal";
import { Empleado } from "../pages/Empleados/empleadosTypes";

Modal.setAppElement("#root");

interface EmpleadoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleado: Empleado | null;
  onEdit: (id: number) => void;
}

const EmpleadoDetailsModal: React.FC<EmpleadoDetailsModalProps> = ({
  isOpen,
  onClose,
  empleado,
  onEdit,
}) => {
  if (!isOpen || !empleado) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal"
      contentLabel="Detalles del Empleado"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
        Detalles del Empleado
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {empleado.id}
        </p>
        <p>
          <strong>Nombre:</strong> {empleado.nombre_razon_social}
        </p>
        <p>
          <strong>Documento:</strong> {empleado.numero_documento}
        </p>
        <p>
          <strong>Tipo Documento:</strong>{" "}
          {empleado.tipo_documento?.abreviatura || "N/A"}
        </p>
        <p>
          <strong>Teléfono1:</strong> {empleado.telefono1 || "N/A"}
        </p>
        <p>
          <strong>Celular:</strong> {empleado.celular || "N/A"}
        </p>
        <p>
          <strong>WhatsApp:</strong> {empleado.whatsapp || "N/A"}
        </p>
        <p>
          <strong>Departamento:</strong>{" "}
          {empleado.departamento?.nombre || "N/A"}
        </p>
        <p>
          <strong>Ciudad:</strong> {empleado.ciudad?.nombre || "N/A"}
        </p>
        <p>
          <strong>Dirección:</strong> {empleado.direccion}
        </p>
        <p>
          <strong>Activo:</strong>{" "}
          {empleado.activo ? "Sí" : "No"}
        </p>
        <p>
          <strong>¿Es vendedor?:</strong>{" "}
          {empleado.es_vendedor ? "Sí" : "No"}
        </p>
        <p>
          <strong>Cargo:</strong> {empleado.cargo || "N/A"}
        </p>
        <p>
          <strong>Fecha Nacimiento:</strong>{" "}
          {empleado.fecha_nacimiento || "N/A"}
        </p>
        <p>
          <strong>Fecha Ingreso:</strong>{" "}
          {empleado.fecha_ingreso || "N/A"}
        </p>
        <p>
          <strong>Observación:</strong> {empleado.observacion || "N/A"}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(empleado.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default EmpleadoDetailsModal;
