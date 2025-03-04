// src/pages/SuperAdmin/Planes/PlanesPage.tsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plan, PlanPayload } from "./PlanesTypes";
import { fetchPlanes, createPlan, updatePlan, deletePlan } from "../../../api/planes";
import PlanesTable from "./PlanesTable";
import PlanFormModal from "./PlanFormModal";
import PlanDetailsModal from "./PlanDetailsModal";
import ConfirmModal from "../../../components/ConfirmModal";
import { FaPlus } from "react-icons/fa";

const PlanesPage: React.FC = () => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  // Cargar planes al montar
  useEffect(() => {
    loadPlanes();
  }, []);

  async function loadPlanes() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlanes();
      setPlanes(data);
    } catch (err) {
      console.error("Error al cargar planes:", err);
      setError("No se pudo cargar la lista de planes");
    } finally {
      setLoading(false);
    }
  }

  // Crear
  function handleCreate() {
    setEditingPlan(null);
    setIsFormOpen(true);
  }

  // Editar
  function handleEdit(planId: number) {
    const found = planes.find((p) => p.id === planId) || null;
    setEditingPlan(found);
    setIsFormOpen(true);
  }

  // Ver detalles
  function handleViewDetails(planId: number) {
    const found = planes.find((p) => p.id === planId) || null;
    setSelectedPlan(found);
    setIsDetailsOpen(true);
  }

  // Eliminar
  function handleDelete(planId: number) {
    const found = planes.find((p) => p.id === planId) || null;
    setPlanToDelete(found);
    setIsConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!planToDelete) return;
    try {
      await deletePlan(planToDelete.id);
      setPlanes((prev) => prev.filter((p) => p.id !== planToDelete.id));
      toast.success("Plan eliminado correctamente");
    } catch (err) {
      console.error("Error eliminando plan:", err);
      toast.error("No se pudo eliminar el plan");
    } finally {
      setIsConfirmOpen(false);
      setPlanToDelete(null);
    }
  }

  // Cerrar formularios
  function closeForm() {
    setIsFormOpen(false);
    setEditingPlan(null);
  }

  async function handleFormSubmit(payload: PlanPayload, planId?: number) {
    try {
      if (planId) {
        // Actualizar
        await updatePlan(planId, payload);
        toast.success("Plan actualizado");
      } else {
        // Crear
        await createPlan(payload);
        toast.success("Plan creado");
      }
      closeForm();
      loadPlanes();
    } catch (err) {
      console.error("Error guardando el plan:", err);
      toast.error("No se pudo guardar el plan.");
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Planes</h1>

      {loading && <p>Cargando planes...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Botón crear */}
      <div className="flex right-end mb-4">
        <button onClick={handleCreate} className="btn bg-blue-600 text-white flex items-center gap-2">
          <FaPlus />
          Crear Plan
        </button>
      </div>

      {/* Tabla de planes */}
      {!loading && !error && planes.length === 0 && (
        <p>No hay planes registrados.</p>
      )}
      {!loading && !error && planes.length > 0 && (
        <PlanesTable
          planes={planes}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Form (crear/editar) */}
      {isFormOpen && (
        <PlanFormModal
          isOpen={isFormOpen}
          onClose={closeForm}
          editingPlan={editingPlan}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Modal Detalles */}
      {isDetailsOpen && (
        <PlanDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          plan={selectedPlan}
          onEdit={(planId) => {
            setIsDetailsOpen(false);
            handleEdit(planId);
          }}
        />
      )}

      {/* Confirm Modal para eliminar */}
      {isConfirmOpen && planToDelete && (
        <ConfirmModal
          isOpen={isConfirmOpen}
          onRequestClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          message={`¿Estás seguro de eliminar el plan "${planToDelete.nombre_plan}"?`}
        />
      )}
    </div>
  );
};

export default PlanesPage;
