// src/pages/CentrosCostos/CentroCostoDetailsModal.tsx

import React from "react";
import Modal from "react-modal";
import { CentroCosto } from "./centrosCostosTypes";

Modal.setAppElement("#root");

interface CentroCostoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  centro: CentroCosto | null;
  onEdit: (id: number) => void;
}

const CentroCostoDetailsModal: React.FC<CentroCostoDetailsModalProps> = ({
  isOpen,
  onClose,
  centro,
  onEdit,
}) => {
  if (!isOpen || !centro) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal"
      contentLabel="Detalles de Centro de Costo"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
        Detalles del Centro de Costo
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {centro.id}
        </p>
        <p>
          <strong>Código:</strong> {centro.codigo}
        </p>
        <p>
          <strong>Nombre:</strong> {centro.nombre}
        </p>
        <p>
          <strong>Nivel:</strong> {centro.nivel}
        </p>
        <p>
          <strong>Padre ID:</strong>{" "}
          {centro.padre_id !== null ? centro.padre_id : "N/A"}
        </p>
        <p>
          <strong>Permite Ingresos:</strong>{" "}
          {centro.permite_ingresos ? "Sí" : "No"}
        </p>
        <p>
          <strong>Estado:</strong> {centro.estado ? "Activo" : "Inactivo"}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(centro.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default CentroCostoDetailsModal;
