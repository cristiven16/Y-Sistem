// src/pages/Cajas/CajasPage.tsx

import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { getCajas, deleteCaja, PaginatedCajas } from "../../api/cajasAPI";
import { Caja } from "./cajasTypes";
import CajasTable from "./CajasTable";
import CajaForm from "./CajaForm";
import ConfirmModal from "../../components/ConfirmModal";

/**
 * Página principal para administrar Cajas.
 * - Soporta búsqueda, paginación sencilla.
 * - Maneja la creación, edición y eliminación de Cajas.
 */
const CajasPage: React.FC = () => {
  const { user } = useAuth();
  // Identificamos la organización actual del usuario:
  const orgId = user?.organizacion_id || 1;

  // Estado para la lista de cajas, paginación y búsqueda
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Control de modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Caja seleccionada para editar o eliminar
  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);

  // Efecto para cargar las cajas la primera vez y cuando cambien:
  // - orgId (si el usuario cambia de organización)
  // - page, search
  useEffect(() => {
    if (orgId) {
      fetchCajas(orgId, page, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, page, search]);

  /**
   * Llamada a la API para obtener la lista paginada de cajas.
   */
  async function fetchCajas(orgId: number, pageNumber: number, searchText: string) {
    setLoading(true);
    setError(null);
    try {
      // Asumiendo que tu API de cajas soporta paginación y búsqueda
      // de forma similar a { data, page, total_paginas, total_registros }
      // Si tu backend NO maneja paginación/búsqueda, ajusta la lógica.
      const resp: PaginatedCajas = await getCajas(orgId, searchText, pageNumber, 10);
      setCajas(resp.data);
      setPage(resp.page);
      setTotalPaginas(resp.total_paginas);
    } catch (err) {
      console.error("Error al obtener cajas:", err);
      setError("No se pudo cargar la lista de cajas.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Navegación entre páginas
   */
  function goToPage(pageNumber: number) {
    setPage(pageNumber);
  }

  /**
   * Manejo de búsqueda
   */
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1); // Reiniciamos a la primera página cuando cambia el filtro
  }

  /**
   * Crear => abre el modal en modo creación
   */
  function handleCreate() {
    setSelectedCaja(null);
    setIsCreateOpen(true);
  }

  /**
   * Editar => busca la Caja en el arreglo y abre el modal en modo edición
   */
  function handleEdit(id: number) {
    const found = cajas.find((c) => c.id === id) || null;
    setSelectedCaja(found);
    setIsEditOpen(true);
  }

  /**
   * Eliminar => abrir confirm modal
   */
  function handleDelete(id: number) {
    const found = cajas.find((c) => c.id === id) || null;
    setSelectedCaja(found);
    setIsConfirmOpen(true);
  }

  /**
   * Confirmar la eliminación
   */
  async function confirmDelete() {
    if (!selectedCaja) return;
    try {
      await deleteCaja(orgId, selectedCaja.id);
      toast.success("Caja eliminada con éxito.");
      // Recargamos la lista en la misma página
      fetchCajas(orgId, page, search);
    } catch (err) {
      console.error("Error al eliminar caja:", err);
      toast.error("No se pudo eliminar la caja.");
    } finally {
      setIsConfirmOpen(false);
      setSelectedCaja(null);
    }
  }

  /**
   * Cerrar modales
   */
  function closeModals() {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsConfirmOpen(false);
    setSelectedCaja(null);
  }

  /**
   * Ver detalles => ejemplo con console.log
   * (Podrías abrir un modal de detalles si lo deseas)
   */
  function handleViewDetails(id: number) {
    console.log("Ver detalles de la caja con id:", id);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cajas</h1>

      {/* Barra de búsqueda + Botón "Agregar Caja" */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar caja..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-600 text-white px-3 py-2 rounded"
        >
          <FaPlus className="mr-2" />
          Agregar Caja
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {cajas.length === 0 ? (
            <div>No hay cajas registradas</div>
          ) : (
            <>
              <CajasTable
                cajas={cajas}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />

              {/* Paginación (si tu backend la soporta) */}
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

      {/* Modal Crear Caja */}
      <CajaForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchCajas(orgId, page, search)}
        organizacionId={orgId}
      />

      {/* Modal Editar Caja */}
      <CajaForm
        isOpen={isEditOpen}
        onClose={closeModals}
        onSuccess={() => {
          fetchCajas(orgId, page, search);
          closeModals();
        }}
        caja={selectedCaja}
        organizacionId={orgId}
      />

      {/* Modal Confirmación Eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onRequestClose={closeModals}
        onConfirm={confirmDelete}
        message={
          selectedCaja
            ? `¿Seguro que deseas eliminar la caja "${selectedCaja.nombre}"?`
            : "¿Seguro que deseas eliminar esta caja?"
        }
      />
    </div>
  );
};

export default CajasPage;
