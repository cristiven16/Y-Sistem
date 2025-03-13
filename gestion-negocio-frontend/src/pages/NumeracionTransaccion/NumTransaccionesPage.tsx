// src/pages/NumeracionTransaccion/NumTransaccionesPage.tsx

import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

// APIs
import {
  getNumTransacciones,
  deleteNumTransaccion,
} from "../../api/numtransaccionAPI";

import {
  NumTransaccion,
  PaginatedNumTransacciones,
} from "./numeracionTransaccionTypes";

import NumTransaccionesTable from "./NumTransaccionesTable";
import NumTransaccionForm from "./NumTransaccionForm";
import NumTransaccionDetailsModal from "./NumTransaccionDetailsModal";
import ConfirmModal from "../../components/ConfirmModal";

const NumTransaccionesPage: React.FC = () => {
  const { user } = useAuth();
  // orgId del user o fallback en 1
  const orgId = user?.organizacion_id || 1;

  // Estado
  const [numTransacciones, setNumTransacciones] = useState<NumTransaccion[]>([]);
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

  const [selectedNum, setSelectedNum] = useState<NumTransaccion | undefined>(undefined);

  useEffect(() => {
    // Cargar la primera vez
    fetchNumTransacciones(orgId, 1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // Si cambia la búsqueda
  useEffect(() => {
    fetchNumTransacciones(orgId, 1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function fetchNumTransacciones(orgId: number, pageNumber: number, searchText: string) {
    setLoading(true);
    setError(undefined);
    try {
      const resp: PaginatedNumTransacciones = await getNumTransacciones(
        orgId,
        searchText,
        pageNumber,
        10
      );
      setNumTransacciones(resp.data);
      setPage(resp.page);
      setTotalPaginas(resp.total_paginas);
    } catch (err) {
      console.error("Error al obtener numeraciones:", err);
      setError("No se pudo cargar la lista de numeraciones.");
    } finally {
      setLoading(false);
    }
  }

  function goToPage(pageNumber: number) {
    fetchNumTransacciones(orgId, pageNumber, search);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  // Crear
  function handleCreate() {
    setSelectedNum(undefined);
    setIsCreateOpen(true);
  }

  // Editar
  function handleEdit(id: number) {
    const found = numTransacciones.find((n) => n.id === id) || undefined;
    setSelectedNum(found);
    setIsEditOpen(true);
  }

  // Detalles
  function handleViewDetails(id: number) {
    const found = numTransacciones.find((n) => n.id === id) || undefined;
    setSelectedNum(found);
    setIsDetailsOpen(true);
  }

  // Eliminar => open confirm
  function handleDelete(id: number) {
    const found = numTransacciones.find((n) => n.id === id) || undefined;
    setSelectedNum(found);
    setIsConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!selectedNum) return;
    try {
      await deleteNumTransaccion(orgId, selectedNum.id);
      toast.success("Numeración eliminada con éxito.");
      fetchNumTransacciones(orgId, page, search);
    } catch (err) {
      console.error("Error al eliminar numeración:", err);
      toast.error("No se pudo eliminar la numeración.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedNum(undefined);
    }
  }

  function closeModals() {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsDetailsOpen(false);
    setIsConfirmOpen(false);
    setSelectedNum(undefined);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Numeraciones de Transacción</h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar numeración..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-600 text-white px-3 py-2 rounded"
        >
          <FaPlus className="mr-2" />
          Agregar Numeración
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {numTransacciones.length === 0 ? (
            <div>No hay numeraciones registradas</div>
          ) : (
            <>
              <NumTransaccionesTable
                numeraciones={numTransacciones}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />

              {/* Paginación */}
              <div className="pagination mt-4">
                <button
                  onClick={() => goToPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className={"page-btn " + (page === 1 ? "page-btn-disabled" : "")}
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
                        "page-btn " + (pageNumber === page ? "page-btn-active" : "")
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
                    "page-btn " + (page === totalPaginas ? "page-btn-disabled" : "")
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
      <NumTransaccionForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchNumTransacciones(orgId, page, search)}
        organizacionId={orgId}
      />

      {/* Modal Editar */}
      <NumTransaccionForm
        isOpen={isEditOpen}
        onClose={closeModals}
        onSuccess={() => {
          fetchNumTransacciones(orgId, page, search);
          closeModals();
        }}
        organizacionId={orgId}
        numeracion={selectedNum}
      />

      {/* Modal Detalles */}
      <NumTransaccionDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeModals}
        numeracion={selectedNum}
        onEdit={(id) => {
          setIsDetailsOpen(false);
          handleEdit(id);
        }}
      />

      {/* ConfirmModal para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedNum
            ? `¿Seguro que deseas eliminar la numeración "${selectedNum.nombre_personalizado}"?`
            : "¿Seguro que deseas eliminar esta numeración?"
        }
      />
    </div>
  );
};

export default NumTransaccionesPage;
