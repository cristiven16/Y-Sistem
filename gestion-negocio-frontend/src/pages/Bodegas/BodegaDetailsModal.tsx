// src/pages/Bodegas/BodegaDetailsModal.tsx

import React from "react";
import Modal from "react-modal";
import { Bodega } from "./bodegasTypes";

Modal.setAppElement("#root");

interface BodegaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bodega: Bodega | null;
  onEdit: (id: number) => void;
}

const BodegaDetailsModal: React.FC<BodegaDetailsModalProps> = ({
  isOpen,
  onClose,
  bodega,
  onEdit,
}) => {
  if (!isOpen || !bodega) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal-overlay"
      contentLabel="Detalles de la Bodega"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
        Detalles de la Bodega
      </h2>

      {/* Grid (1 o 2 columnas según el espacio) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {bodega.id}
        </p>
        <p>
          <strong>Nombre:</strong> {bodega.nombre}
        </p>
        <p>
          <strong>Sucursal ID:</strong> {bodega.sucursal_id}
        </p>
        <p>
          <strong>¿Por defecto?:</strong>{" "}
          {bodega.bodega_por_defecto ? "Sí" : "No"}
        </p>
        <p>
          <strong>Estado:</strong> {bodega.estado ? "Activa" : "Inactiva"}
        </p>
        <p>
          <strong>Organización:</strong> {bodega.organizacion_id}
        </p>
        {/* Si tu backend retorna "bodega.sucursal" => puedes mostrar bodega.sucursal.nombre */}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(bodega.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default BodegaDetailsModal;
