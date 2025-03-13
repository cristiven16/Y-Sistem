// src/pages/TiendasVirtuales/TiendaVirtualDetailsModal.tsx

import React from "react";
import Modal from "react-modal";
import { TiendaVirtual } from "./tiendasvirtualesTypes";

Modal.setAppElement("#root");

interface TiendaVirtualDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tienda: TiendaVirtual | null;
  onEdit: (id: number) => void;
}

const TiendaVirtualDetailsModal: React.FC<TiendaVirtualDetailsModalProps> = ({
  isOpen,
  onClose,
  tienda,
  onEdit,
}) => {
  if (!isOpen || !tienda) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal-overlay"
      contentLabel="Detalles de la Tienda Virtual"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
        Detalles de la Tienda Virtual
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {tienda.id}
        </p>
        <p>
          <strong>Organización:</strong> {tienda.organizacion_id}
        </p>
        <p>
          <strong>Plataforma:</strong> {tienda.plataforma || "N/A"}
        </p>
        <p>
          <strong>Nombre:</strong> {tienda.nombre}
        </p>
        <p>
          <strong>URL:</strong> {tienda.url || "N/A"}
        </p>
        <p>
          <strong>Centro de Costo ID:</strong>{" "}
          {tienda.centro_costo_id !== undefined
            ? tienda.centro_costo_id
            : "N/A"}
        </p>
        <p>
          <strong>Estado:</strong> {tienda.estado ? "Activa" : "Inactiva"}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(tienda.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default TiendaVirtualDetailsModal;
