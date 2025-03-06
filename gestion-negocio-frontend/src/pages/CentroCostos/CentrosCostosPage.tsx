// src/pages/CentrosCostos/CentrosCostosPage.tsx

import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import {
  getCentrosCostos,
  deleteCentroCosto,
  PaginatedCentrosCostos,
} from "../../api/centrocostosAPI";
import { CentroCosto } from "./centrosCostosTypes";
import CentrosCostosTable from "./CentrosCostosTable";
import CentroCostoForm from "./CentroCostoForm";
import ConfirmModal from "../../components/ConfirmModal";
import CentroCostoDetailsModal from "./CentroCostoDetailsModal";

const CentrosCostosPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizacion_id || 1;

  const [centros, setCentros] = useState<CentroCosto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modales para crear/editar
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState<CentroCosto | null>(null);

  // Modal de detalles
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailCentro, setDetailCentro] = useState<CentroCosto | null>(null);

  // Modal de confirmación de eliminación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (orgId) {
      fetchCentros(orgId, page, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, page, search]);

  async function fetchCentros(
    orgId: number,
    pageNumber: number,
    searchText: string
  ) {
    setLoading(true);
    setError(null);
    try {
      const resp: PaginatedCentrosCostos = await getCentrosCostos(
        orgId,
        searchText,
        pageNumber,
        10
      );
      setCentros(resp.data);
      setPage(resp.page);
      setTotalPaginas(resp.total_paginas);
    } catch (err) {
      console.error("Error al obtener centros de costo:", err);
      setError("No se pudo cargar la lista de centros de costo.");
    } finally {
      setLoading(false);
    }
  }

  function goToPage(pageNumber: number) {
    setPage(pageNumber);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  /** Crear => abre modal en modo creación */
  function handleCreate() {
    setSelectedCentro(null);
    setIsCreateOpen(true);
  }

  /** Editar => busca el centro y abre modal de edición */
  function handleEdit(id: number) {
    const found = centros.find((c) => c.id === id) || null;
    setSelectedCentro(found);
    setIsEditOpen(true);
  }

  /** Eliminar => abrir confirm modal */
  function handleDelete(id: number) {
    const found = centros.find((c) => c.id === id) || null;
    setSelectedCentro(found);
    setIsConfirmOpen(true);
  }

  /** Confirmar la eliminación */
  async function confirmDelete() {
    if (!selectedCentro) return;
    try {
      await deleteCentroCosto(orgId, selectedCentro.id);
      toast.success("Centro de costo eliminado con éxito.");
      fetchCentros(orgId, page, search);
    } catch (err) {
      console.error("Error al eliminar centro de costo:", err);
      toast.error("No se pudo eliminar el centro de costo.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedCentro(null);
    }
  }

  /** Cerrar todos los modales */
  function closeModals() {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsConfirmOpen(false);
    setIsDetailsOpen(false);
    setSelectedCentro(null);
    setDetailCentro(null);
  }

  /** Ver detalles => abrir modal de detalles */
  function handleViewDetails(id: number) {
    const found = centros.find((c) => c.id === id) || null;
    setDetailCentro(found);
    setIsDetailsOpen(true);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Centros de Costo</h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar centro de costo..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-600 text-white px-3 py-2 rounded"
        >
          <FaPlus className="mr-2" />
          Agregar Centro de Costo
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {centros.length === 0 ? (
            <div>No hay centros de costo registrados</div>
          ) : (
            <>
              <CentrosCostosTable
                centros={centros}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />

              {/* Paginación */}
              <div className="pagination mt-4">
                <button
                  onClick={() => goToPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className={
                    "page-btn " + (page === 1 ? "page-btn-disabled" : "")
                  }
                >
                  Anterior
                </button>
                {Array.from({ length: totalPaginas }).map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={
                        "page-btn " +
                        (pageNumber === page ? "page-btn-active" : "")
                      }
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => goToPage(Math.min(page + 1, totalPaginas))}
                  disabled={page === totalPaginas}
                  className={
                    "page-btn " +
                    (page === totalPaginas ? "page-btn-disabled" : "")
                  }
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal Crear */}
      <CentroCostoForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchCentros(orgId, page, search)}
        organizacionId={orgId}
      />

      {/* Modal Editar */}
      <CentroCostoForm
        isOpen={isEditOpen}
        onClose={closeModals}
        onSuccess={() => {
          fetchCentros(orgId, page, search);
          closeModals();
        }}
        centro={selectedCentro}
        organizacionId={orgId}
      />

      {/* Modal Detalles */}
      <CentroCostoDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        centro={detailCentro}
        onEdit={handleEdit}
      />

      {/* Modal Confirmación Eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedCentro
            ? `¿Seguro que deseas eliminar el centro de costo "${selectedCentro.nombre}"?`
            : "¿Seguro que deseas eliminar este centro de costo?"
        }
      />
    </div>
  );
};

export default CentrosCostosPage;
