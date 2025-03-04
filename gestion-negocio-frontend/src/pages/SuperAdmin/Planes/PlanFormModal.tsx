// src/pages/SuperAdmin/Planes/PlanFormModal.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { Plan, PlanPayload } from "./PlanesTypes";

Modal.setAppElement("#root");

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: PlanPayload, planId?: number) => Promise<void>;
  editingPlan?: Plan | null; // si no es null => estamos editando
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPlan,
}) => {
  // Campos del formulario
  const [nombrePlan, setNombrePlan] = useState("");
  const [maxUsuarios, setMaxUsuarios] = useState(10);
  const [maxEmpleados, setMaxEmpleados] = useState(0);
  const [maxSucursales, setMaxSucursales] = useState(1);
  const [precio, setPrecio] = useState<number | null>(null);
  const [soportePrioritario, setSoportePrioritario] = useState(false);
  const [usoIlimitadoFunciones, setUsoIlimitadoFunciones] = useState(true);
  const [duracionDias, setDuracionDias] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && editingPlan) {
      // Modo edición: cargar datos del plan
      setNombrePlan(editingPlan.nombre_plan);
      setMaxUsuarios(editingPlan.max_usuarios);
      setMaxEmpleados(editingPlan.max_empleados ?? 0);
      setMaxSucursales(editingPlan.max_sucursales ?? 1);
      setPrecio(editingPlan.precio ?? null);
      setSoportePrioritario(editingPlan.soporte_prioritario ?? false);
      setUsoIlimitadoFunciones(editingPlan.uso_ilimitado_funciones ?? true);
      setDuracionDias(editingPlan.duracion_dias ?? null);
    } else if (isOpen && !editingPlan) {
      // Modo creación: valores por defecto
      setNombrePlan("");
      setMaxUsuarios(10);
      setMaxEmpleados(0);
      setMaxSucursales(1);
      setPrecio(null);
      setSoportePrioritario(false);
      setUsoIlimitadoFunciones(true);
      setDuracionDias(null);
    }
  }, [isOpen, editingPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PlanPayload = {
      nombre_plan: nombrePlan,
      max_usuarios: maxUsuarios,
      max_empleados: maxEmpleados,
      max_sucursales: maxSucursales,
      precio,
      soporte_prioritario: soportePrioritario,
      uso_ilimitado_funciones: usoIlimitadoFunciones,
      duracion_dias: duracionDias,
    };
    await onSubmit(payload, editingPlan?.id);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-xl w-full max-h-[80vh] overflow-auto"
      overlayClassName="modal-overlay"
      contentLabel="Formulario de Plan"
    >
      <h2 className="text-xl font-bold mb-4">
        {editingPlan ? "Editar Plan" : "Crear Plan"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre del Plan */}
        <div className="flex flex-col">
          <label className="label" htmlFor="nombre_plan">
            Nombre del Plan
          </label>
          <input
            id="nombre_plan"
            type="text"
            className="input-field"
            value={nombrePlan}
            onChange={(e) => setNombrePlan(e.target.value)}
            required
          />
        </div>

        {/* Máx. Usuarios */}
        <div className="flex flex-col">
          <label className="label" htmlFor="max_usuarios">
            Máx. Usuarios
          </label>
          <input
            id="max_usuarios"
            type="number"
            className="input-field"
            value={maxUsuarios}
            onChange={(e) => setMaxUsuarios(Number(e.target.value))}
          />
        </div>

        {/* Máx. Empleados */}
        <div className="flex flex-col">
          <label className="label" htmlFor="max_empleados">
            Máx. Empleados
          </label>
          <input
            id="max_empleados"
            type="number"
            className="input-field"
            value={maxEmpleados}
            onChange={(e) => setMaxEmpleados(Number(e.target.value))}
          />
        </div>

        {/* Máx. Sucursales */}
        <div className="flex flex-col">
          <label className="label" htmlFor="max_sucursales">
            Máx. Sucursales
          </label>
          <input
            id="max_sucursales"
            type="number"
            className="input-field"
            value={maxSucursales}
            onChange={(e) => setMaxSucursales(Number(e.target.value))}
          />
        </div>

        {/* Precio */}
        <div className="flex flex-col">
          <label className="label" htmlFor="precio">
            Precio
          </label>
          <input
            id="precio"
            type="number"
            step="0.01"
            className="input-field"
            value={precio ?? ""}
            onChange={(e) =>
              setPrecio(e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </div>

        {/* Soporte Prioritario */}
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            id="soporte_prioritario"
            checked={soportePrioritario}
            onChange={(e) => setSoportePrioritario(e.target.checked)}
          />
          <label htmlFor="soporte_prioritario" className="label">
            Soporte prioritario
          </label>
        </div>

        {/* Uso Ilimitado Funciones */}
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            id="uso_ilimitado_funciones"
            checked={usoIlimitadoFunciones}
            onChange={(e) => setUsoIlimitadoFunciones(e.target.checked)}
          />
          <label htmlFor="uso_ilimitado_funciones" className="label">
            Uso ilimitado de funciones
          </label>
        </div>

        {/* Duración (días) */}
        <div className="flex flex-col">
          <label className="label" htmlFor="duracion_dias">
            Duración (días)
          </label>
          <input
            id="duracion_dias"
            type="number"
            className="input-field"
            value={duracionDias ?? ""}
            onChange={(e) =>
              setDuracionDias(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
          />
        </div>

        {/* Botones */}
        <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 mt-4">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary bg-blue-600">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PlanFormModal;
