// src/pages/NumeracionTransaccion/NumTransaccionDetailsModal.tsx

import React from "react";
import Modal from "react-modal";
import { NumTransaccion } from "./numeracionTransaccionTypes";

Modal.setAppElement("#root");

interface NumTransaccionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  numeracion: NumTransaccion | undefined;
  onEdit: (id: number) => void;
}

const NumTransaccionDetailsModal: React.FC<NumTransaccionDetailsModalProps> = ({
  isOpen,
  onClose,
  numeracion,
  onEdit,
}) => {
  if (!isOpen || !numeracion) return undefined;

  // Puedes console.log si quieres debug
  // console.log("Detalles NumTransaccion:", numeracion);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content relative bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-xl"
      overlayClassName="modal"
      contentLabel="Detalles de la Numeración de Transacción"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
        Detalles de la Numeración
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {numeracion.id}
        </p>
        <p>
          <strong>Organización:</strong> {numeracion.organizacion_id}
        </p>
        <p>
          <strong>Nombre Personalizado:</strong> {numeracion.nombre_personalizado}
        </p>
        <p>
          <strong>Título:</strong> {numeracion.titulo_transaccion}
        </p>
        <p>
          <strong>Prefijo:</strong> {numeracion.prefijo || "N/A"}
        </p>
        <p>
          <strong>Separador:</strong> {numeracion.separador_prefijo || "N/A"}
        </p>
        <p>
          <strong>Número Resolución:</strong>{" "}
          {numeracion.numero_resolucion || "N/A"}
        </p>
        <p>
          <strong>Fecha Expedición:</strong>{" "}
          {numeracion.fecha_expedicion || "N/A"}
        </p>
        <p>
          <strong>Fecha Vencimiento:</strong>{" "}
          {numeracion.fecha_vencimiento || "N/A"}
        </p>
        <p>
          <strong>Número Inicial:</strong> {numeracion.numeracion_inicial}
        </p>
        <p>
          <strong>Número Final:</strong> {numeracion.numeracion_final}
        </p>
        <p>
          <strong>Siguiente:</strong> {numeracion.numeracion_siguiente}
        </p>
        <p>
          <strong>Por Defecto:</strong>{" "}
          {numeracion.numeracion_por_defecto ? "Sí" : "No"}
        </p>
        <p>
          <strong>Mostrar Info Numeración:</strong>{" "}
          {numeracion.mostrar_info_numeracion ? "Sí" : "No"}
        </p>
        <p>
          <strong>Electrónica:</strong>{" "}
          {numeracion.transaccion_electronica ? "Sí" : "No"}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(numeracion.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default NumTransaccionDetailsModal;
 