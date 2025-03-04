import React from "react";
import Modal from "react-modal";
import { Sucursal } from "./sucursalesTypes";

Modal.setAppElement("#root");

interface SucursalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sucursal: Sucursal | null;
  onEdit?: (id: number) => void; // Por si deseas botón "Editar"
}

const SucursalDetailsModal: React.FC<SucursalDetailsModalProps> = ({
  isOpen,
  onClose,
  sucursal,
  onEdit,
}) => {
  if (!isOpen || !sucursal) return null;

  // Podrías mostrar "N/A" en caso de null/undefined
  const deptoName = sucursal.departamento?.nombre || "N/A";
  const cityName = sucursal.ciudad?.nombre || "N/A";
  const pais = sucursal.pais || "N/A";
  const telefonos = sucursal.telefonos || "N/A";

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal"
      contentLabel="Detalles de la Sucursal"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      {/* Botón X para cerrar */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">Detalles de la Sucursal</h2>

      {/* Estructura en grid, 2 columnas en pantallas >=640px */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {sucursal.id}
        </p>
        <p>
          <strong>Nombre:</strong> {sucursal.nombre}
        </p>
        <p>
          <strong>País:</strong> {pais}
        </p>
        <p>
          <strong>Departamento:</strong> {deptoName}
        </p>
        <p>
          <strong>Ciudad:</strong> {cityName}
        </p>
        <p>
          <strong>Dirección:</strong> {sucursal.direccion || "N/A"}
        </p>
        <p>
          <strong>Teléfonos:</strong> {telefonos}
        </p>
        <p>
          <strong>Prefijo:</strong>{" "}
          {sucursal.prefijo_transacciones || "N/A"}
        </p>
        <p>
          <strong>Principal:</strong>{" "}
          {sucursal.sucursal_principal ? "Sí" : "No"}
        </p>
        <p>
          <strong>Activa:</strong> {sucursal.activa ? "Sí" : "No"}
        </p>
        {/* Agrega más campos si tu backend/sucursal los provee */}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        {onEdit && (
          <button
            onClick={() => {
              onClose();
              onEdit(sucursal.id);
            }}
            className="btn-primary bg-blue-600"
          >
            Editar
          </button>
        )}
      </div>
    </Modal>
  );
};

export default SucursalDetailsModal;
