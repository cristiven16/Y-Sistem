// src/pages/Cajas/CajaDetailsModal.tsx

import React from "react";
import Modal from "react-modal";
import { Caja } from "./cajasTypes";

Modal.setAppElement("#root");

interface CajaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caja: Caja | null;
  onEdit: (id: number) => void;
}

const CajaDetailsModal: React.FC<CajaDetailsModalProps> = ({
  isOpen,
  onClose,
  caja,
  onEdit,
}) => {
  if (!isOpen || !caja) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal"
      contentLabel="Detalles de Caja"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
        Detalles de la Caja
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {caja.id}
        </p>
        <p>
          <strong>Nombre:</strong> {caja.nombre}
        </p>
        <p>
          <strong>Sucursal ID:</strong> {caja.sucursal_id}
        </p>
        <p>
          <strong>Estado:</strong> {caja.estado ? "Activa" : "Inactiva"}
        </p>
        <p>
          <strong>Vigencia:</strong> {caja.vigencia ? "Vigente" : "No vigente"}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(caja.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default CajaDetailsModal;
