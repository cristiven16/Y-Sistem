import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Asegura accesibilidad

interface ConfirmModalProps {
  isOpen: boolean;
  onRequestClose: () => void; // al hacer clic en "Cancelar" o fuera del modal
  onConfirm: () => void;      // acción principal (eliminar)
  message: string;            // texto de confirmación
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  message
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal-content"
      overlayClassName="modal-overlay"
      contentLabel="Confirmar acción"
      shouldCloseOnOverlayClick={true}
    >
      <h2 className="text-lg font-bold">Confirmación</h2>
      <p className="mt-2">{message}</p>
      <div className="flex justify-end gap-2 mt-4">
        <button className="btn-secondary" onClick={onRequestClose}>
          Cancelar
        </button>
        <button className="btn-primary bg-red-600" onClick={onConfirm}>
          Eliminar
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
