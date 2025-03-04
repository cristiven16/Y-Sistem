// src/pages/SuperAdmin/Planes/PlanDetailsModal.tsx

import React from "react";
import Modal from "react-modal";
import { Plan } from "./PlanesTypes";

Modal.setAppElement("#root");

interface PlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  onEdit: (planId: number) => void;
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
  isOpen,
  onClose,
  plan,
  onEdit,
}) => {
  if (!isOpen || !plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-xl w-full max-h-[80vh] overflow-auto"
      overlayClassName="modal-overlay"
      contentLabel="Detalles del Plan"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">Detalles del Plan</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p>
          <strong>ID:</strong> {plan.id}
        </p>
        <p>
          <strong>Nombre:</strong> {plan.nombre_plan}
        </p>
        <p>
          <strong>Máx. Usuarios:</strong> {plan.max_usuarios}
        </p>
        <p>
          <strong>Máx. Empleados:</strong> {plan.max_empleados ?? 0}
        </p>
        <p>
          <strong>Máx. Sucursales:</strong> {plan.max_sucursales ?? 1}
        </p>
        <p>
          <strong>Precio:</strong> {plan.precio ?? "N/A"}
        </p>
        <p>
          <strong>Soporte Prioritario:</strong>{" "}
          {plan.soporte_prioritario ? "Sí" : "No"}
        </p>
        <p>
          <strong>Uso Ilimitado Funciones:</strong>{" "}
          {plan.uso_ilimitado_funciones ? "Sí" : "No"}
        </p>
        <p>
          <strong>Duración (días):</strong> {plan.duracion_dias ?? "N/A"}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary">
          Cerrar
        </button>
        <button
          onClick={() => {
            onClose();
            onEdit(plan.id);
          }}
          className="btn-primary bg-blue-600"
        >
          Editar
        </button>
      </div>
    </Modal>
  );
};

export default PlanDetailsModal;
