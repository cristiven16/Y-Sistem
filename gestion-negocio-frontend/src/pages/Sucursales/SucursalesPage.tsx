import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

import { useAuth } from "../../hooks/useAuth";
import { getSucursales, deleteSucursal } from "../../api/sucursalesAPI";
import { Sucursal, PaginatedSucursales } from "./sucursalesTypes";
import SucursalesTable from "./SucursalesTable";
import SucursalForm from "./SucursalForm";
import SucursalDetailsModal from "./SucursalDetailsModal"; // Importar tu modal
import ConfirmModal from "../../components/ConfirmModal";

const SucursalesPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizacion_id || 1;

  // Lista y paginación
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modales (crear, editar, confirmar eliminar)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Modal de detalles
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Sucursal seleccionada para cualquiera de los modales
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);

  // Al montar o si cambia orgId
  useEffect(() => {
    if (orgId) {
      fetchSucursales(orgId, 1, search);
    }
  }, [orgId]);

  // Si cambia "search"
  useEffect(() => {
    if (orgId) {
      fetchSucursales(orgId, 1, search);
    }
  }, [search]);

  async function fetchSucursales(orgId: number, pageNumber: number, searchText: string) {
    setLoading(true);
    setError(null);
    try {
      const resp: PaginatedSucursales = await getSucursales(orgId, searchText, pageNumber, 10);
      setSucursales(resp.data);
      setPage(resp.page);
      setTotalPaginas(resp.total_paginas);
    } catch (err) {
      console.error("Error al obtener sucursales:", err);
      setError("No se pudo cargar la lista de sucursales.");
    } finally {
      setLoading(false);
    }
  }

  function goToPage(pageNumber: number) {
    if (!orgId) return;
    fetchSucursales(orgId, pageNumber, search);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  // Crear => abre modal SucursalForm en modo "nuevo"
  function handleCreate() {
    setSelectedSucursal(null);
    setIsCreateOpen(true);
  }

  // Edit => abre modal SucursalForm en modo "editar"
  function handleEdit(id: number) {
    const found = sucursales.find((s) => s.id === id) || null;
    setSelectedSucursal(found);
    setIsEditOpen(true);
  }

  // Eliminar => open confirm
  function handleDelete(id: number) {
    const found = sucursales.find((s) => s.id === id) || null;
    setSelectedSucursal(found);
    setIsConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!selectedSucursal || !orgId) return;
    try {
      await deleteSucursal(orgId, selectedSucursal.id);
      toast.success("Sucursal eliminada");
      fetchSucursales(orgId, page, search); // recarga la misma página
    } catch (error) {
      console.error("Error al eliminar sucursal:", error);
      toast.error("No se pudo eliminar la sucursal.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedSucursal(null);
    }
  }

  // Ver detalles => abrimos modal
  function handleViewDetails(id: number) {
    const found = sucursales.find((s) => s.id === id) || null;
    setSelectedSucursal(found);
    setIsDetailsOpen(true);
  }

  // Cerrar todos los modales
  function closeModals() {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsConfirmOpen(false);
    setIsDetailsOpen(false);
    setSelectedSucursal(null);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sucursales</h1>

      {/* Barra de búsqueda + Botón Agregar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar sucursal..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-600 text-white px-3 py-2 rounded"
        >
          <FaPlus className="mr-2" />
          Agregar Sucursal
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {sucursales.length === 0 ? (
            <div>No hay resultados</div>
          ) : (
            <SucursalesTable
              sucursales={sucursales}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          )}

          {/* Paginación */}
          <div className="pagination mt-4">
            <button
              onClick={() => goToPage(Math.max(page - 1, 1))}
              disabled={page === 1}
              className={`page-btn ${page === 1 ? "page-btn-disabled" : ""}`}
            >
              Anterior
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                className={`page-btn ${pageNumber === page ? "page-btn-active" : ""}`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => goToPage(Math.min(page + 1, totalPaginas))}
              disabled={page === totalPaginas}
              className={`page-btn ${page === totalPaginas ? "page-btn-disabled" : ""}`}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {/* Modal Crear Sucursal */}
      <SucursalForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          if (orgId) fetchSucursales(orgId, page, search);
        }}
        organizacionId={orgId}
      />

      {/* Modal Editar Sucursal */}
      <SucursalForm
        isOpen={isEditOpen}
        onClose={closeModals}
        onSuccess={() => {
          if (orgId) fetchSucursales(orgId, page, search);
          closeModals();
        }}
        sucursal={selectedSucursal}
        organizacionId={orgId}
      />

      {/* Modal Detalles Sucursal */}
      <SucursalDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        sucursal={selectedSucursal}
      />

      {/* ConfirmModal para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedSucursal
            ? `¿Estás seguro de eliminar la sucursal "${selectedSucursal.nombre}"?`
            : "¿Estás seguro de eliminar esta sucursal?"
        }
      />
    </div>
  );
};

export default SucursalesPage;
