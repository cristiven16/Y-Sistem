import React from "react";
import Modal from "react-modal";
import { Sucursal } from "./sucursalesTypes";

Modal.setAppElement("#root");

interface SucursalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sucursal: Sucursal | null;
}

const SucursalDetailsModal: React.FC<SucursalDetailsModalProps> = ({
  isOpen,
  onClose,
  sucursal,
}) => {
  // Si no está abierto o no hay sucursal, no renderices nada
  if (!isOpen || !sucursal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
      overlayClassName="modal-overlay"
      contentLabel="Detalles de la Sucursal"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <h2 className="text-xl font-bold mb-4">Detalles de la Sucursal</h2>
      <div className="space-y-2">
        <p><strong>ID:</strong> {sucursal.id}</p>
        <p><strong>Nombre:</strong> {sucursal.nombre}</p>
        <p><strong>País:</strong> {sucursal.pais || "N/A"}</p>
        <p><strong>Departamento:</strong> {sucursal.departamento?.nombre || "N/A"}</p>
        <p><strong>Ciudad:</strong> {sucursal.ciudad?.nombre || "N/A"}</p>
        <p><strong>Dirección:</strong> {sucursal.direccion}</p>
        <p><strong>Teléfonos:</strong> {sucursal.telefonos || "N/A"}</p>
        <p><strong>Prefijo:</strong> {sucursal.prefijo_transacciones || "N/A"}</p>
        <p><strong>Principal:</strong> {sucursal.sucursal_principal ? "Sí" : "No"}</p>
        <p><strong>Activa:</strong> {sucursal.activa ? "Sí" : "No"}</p>
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

export default SucursalDetailsModal;
