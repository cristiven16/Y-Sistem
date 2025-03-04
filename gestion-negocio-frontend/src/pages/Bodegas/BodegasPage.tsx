// src/pages/Bodegas/BodegasPage.tsx

import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import {
  getBodegas,
  deleteBodega,
} from "../../api/bodegasAPI";
import { Bodega, PaginatedBodegas } from "./bodegasTypes";
import BodegasTable from "./BodegasTable";
import BodegaForm from "./BodegaForm";
import ConfirmModal from "../../components/ConfirmModal";
import BodegaDetailsModal from "./BodegaDetailsModal";

const BodegasPage: React.FC = () => {
  const { user } = useAuth();
  // Obtenemos orgId del usuario logueado (o fallback en 1)
  const orgId = user?.organizacion_id || 1;

  // Estado para la lista y paginación
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Bodega seleccionada para editar/ver detalles/eliminar
  const [selectedBodega, setSelectedBodega] = useState<Bodega | null>(null);

  // Cargar bodegas al montar (y cada vez que cambie orgId)
  useEffect(() => {
    if (orgId) {
      fetchBodegas(orgId, 1, search);
    }
  }, [orgId]);

  // Cuando cambie la búsqueda
  useEffect(() => {
    if (orgId) {
      fetchBodegas(orgId, 1, search);
    }
  }, [search]);

  async function fetchBodegas(orgId: number, pageNumber: number, searchText: string) {
    setLoading(true);
    setError(null);
    try {
      // Asumiendo que getBodegas() admite (orgId, search, page, page_size)
      // y retorna { data, page, total_paginas, total_registros }
      const resp: PaginatedBodegas = await getBodegas(orgId, searchText, pageNumber, 10);
      setBodegas(resp.data);
      setPage(resp.page);
      setTotalPaginas(resp.total_paginas);
    } catch (err) {
      console.error("Error al obtener bodegas:", err);
      setError("No se pudo cargar la lista de bodegas.");
    } finally {
      setLoading(false);
    }
  }

  function goToPage(pageNumber: number) {
    if (!orgId) return;
    fetchBodegas(orgId, pageNumber, search);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  // Crear => abre modal
  function handleCreate() {
    setSelectedBodega(null);
    setIsCreateOpen(true);
  }

  // Edit => abre modal
  function handleEdit(id: number) {
    const found = bodegas.find((b) => b.id === id) || null;
    setSelectedBodega(found);
    setIsEditOpen(true);
  }

  // Ver detalles => abre modal
  function handleViewDetails(id: number) {
    const found = bodegas.find((b) => b.id === id) || null;
    setSelectedBodega(found);
    setIsDetailsOpen(true);
  }

  // Eliminar => open confirm
  function handleDelete(id: number) {
    const found = bodegas.find((b) => b.id === id) || null;
    setSelectedBodega(found);
    setIsConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!selectedBodega || !orgId) return;
    try {
      await deleteBodega(orgId, selectedBodega.id);
      toast.success("Bodega eliminada");
      fetchBodegas(orgId, page, search);
    } catch (error) {
      console.error("Error al eliminar bodega:", error);
      toast.error("No se pudo eliminar la bodega.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedBodega(null);
    }
  }

  // Cerrar todos modales
  function closeModals() {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsDetailsOpen(false);
    setIsConfirmOpen(false);
    setSelectedBodega(null);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bodegas</h1>

      {/* Barra de búsqueda + Botón Agregar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar bodega..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-600 text-white px-3 py-2 rounded"
        >
          <FaPlus className="mr-2" />
          Agregar Bodega
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {bodegas.length === 0 ? (
            <div>No hay resultados</div>
          ) : (
            <BodegasTable
              bodegas={bodegas}
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
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => goToPage(num)}
                className={`page-btn ${num === page ? "page-btn-active" : ""}`}
              >
                {num}
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

      {/* Modal Crear Bodega */}
      <BodegaForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          if (!orgId) return;
          fetchBodegas(orgId, page, search);
        }}
        organizacionId={orgId}
      />

      {/* Modal Editar Bodega */}
      <BodegaForm
        isOpen={isEditOpen}
        bodega={selectedBodega}
        onClose={closeModals}
        onSuccess={() => {
          if (!orgId) return;
          fetchBodegas(orgId, page, search);
          closeModals();
        }}
        organizacionId={orgId}
      />

      {/* Modal Detalles Bodega */}
      <BodegaDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeModals}
        bodega={selectedBodega}
        onEdit={(bId) => {
          setIsDetailsOpen(false);
          handleEdit(bId);
        }}
      />

      {/* ConfirmModal para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedBodega
            ? `¿Estás seguro de eliminar la bodega "${selectedBodega.nombre}"?`
            : "¿Estás seguro de eliminar esta bodega?"
        }
      />
    </div>
  );
};

export default BodegasPage;
