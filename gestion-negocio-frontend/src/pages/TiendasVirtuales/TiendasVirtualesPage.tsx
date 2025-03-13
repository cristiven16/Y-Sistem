// src/pages/TiendasVirtuales/TiendasVirtualesPage.tsx

import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import {
  getTiendasVirtuales,
  deleteTiendaVirtual,
} from "../../api/tiendasvirtualesAPI";
import {
  TiendaVirtual,
  PaginatedTiendasVirtuales,
} from "./tiendasvirtualesTypes";
import TiendasVirtualesTable from "./TiendasVirtualesTable";
import TiendaVirtualForm from "./TiendaVirtualForm";
import TiendaVirtualDetailsModal from "./TiendaVirtualDetailsModal";
import ConfirmModal from "../../components/ConfirmModal";

const TiendasVirtualesPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizacion_id || 1;

  const [tiendas, setTiendas] = useState<TiendaVirtual[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [selectedTienda, setSelectedTienda] = useState<TiendaVirtual | undefined>(
    undefined
  );

  // Cargar la lista al montar
  useEffect(() => {
    if (orgId) {
      fetchTiendas(orgId, 1, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // Cargar cuando cambie 'search'
  useEffect(() => {
    if (orgId) {
      fetchTiendas(orgId, 1, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function fetchTiendas(orgId: number, pageNumber: number, searchText: string) {
    setLoading(true);
    setError(undefined);
    try {
      const resp: PaginatedTiendasVirtuales = await getTiendasVirtuales(
        orgId,
        searchText,
        pageNumber,
        10
      );
      setTiendas(resp.data);
      setPage(resp.page);
      setTotalPaginas(resp.total_paginas);
    } catch (err) {
      console.error("Error al obtener tiendas virtuales:", err);
      setError("No se pudo cargar la lista de Tiendas Virtuales.");
    } finally {
      setLoading(false);
    }
  }

  function goToPage(pageNumber: number) {
    fetchTiendas(orgId, pageNumber, search);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  // Crear => modal
  function handleCreate() {
    setSelectedTienda(undefined);
    setIsCreateOpen(true);
  }

  // Editar => modal
  function handleEdit(id: number) {
    const found = tiendas.find((t) => t.id === id) || undefined;
    setSelectedTienda(found);
    setIsEditOpen(true);
  }

  // Detalles => modal
  function handleViewDetails(id: number) {
    const found = tiendas.find((t) => t.id === id) || undefined;
    setSelectedTienda(found);
    setIsDetailsOpen(true);
  }

  // Eliminar => confirm
  function handleDelete(id: number) {
    const found = tiendas.find((t) => t.id === id) || undefined;
    setSelectedTienda(found);
    setIsConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!selectedTienda) return;
    try {
      await deleteTiendaVirtual(orgId, selectedTienda.id);
      toast.success("Tienda Virtual eliminada con éxito.");
      fetchTiendas(orgId, page, search);
    } catch (error) {
      console.error("Error al eliminar Tienda Virtual:", error);
      toast.error("No se pudo eliminar la Tienda Virtual.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedTienda(undefined);
    }
  }

  function closeModals() {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsDetailsOpen(false);
    setIsConfirmOpen(false);
    setSelectedTienda(undefined);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tiendas Virtuales</h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar tienda..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-600 text-white px-3 py-2 rounded"
        >
          <FaPlus className="mr-2" />
          Agregar Tienda Virtual
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {tiendas.length === 0 ? (
            <div>No hay tiendas virtuales registradas</div>
          ) : (
            <>
              <TiendasVirtualesTable
                tiendas={tiendas}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />

              {/* Paginación */}
              <div className="pagination mt-4">
                <button
                  onClick={() => goToPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className={`page-btn ${page === 1 ? "page-btn-disabled" : ""}`}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      onClick={() => goToPage(num)}
                      className={`page-btn ${
                        num === page ? "page-btn-active" : ""
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
                <button
                  onClick={() => goToPage(Math.min(page + 1, totalPaginas))}
                  disabled={page === totalPaginas}
                  className={`page-btn ${
                    page === totalPaginas ? "page-btn-disabled" : ""
                  }`}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal Crear */}
      <TiendaVirtualForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchTiendas(orgId, page, search);
        }}
        organizacionId={orgId}
      />

      {/* Modal Editar */}
      <TiendaVirtualForm
        isOpen={isEditOpen}
        tienda={selectedTienda}
        onClose={closeModals}
        onSuccess={() => {
          fetchTiendas(orgId, page, search);
          closeModals();
        }}
        organizacionId={orgId}
      />

      {/* Modal Detalles */}
      <TiendaVirtualDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeModals}
        tienda={selectedTienda ?? null}
        onEdit={(tid) => {
          setIsDetailsOpen(false);
          handleEdit(tid);
        }}
      />

      {/* ConfirmModal para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedTienda
            ? `¿Estás seguro de eliminar la tienda virtual "${selectedTienda.nombre}"?`
            : "¿Estás seguro de eliminar esta tienda virtual?"
        }
      />
    </div>
  );
};

export default TiendasVirtualesPage;
