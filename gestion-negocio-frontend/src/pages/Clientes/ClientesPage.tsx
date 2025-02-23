import React, { useEffect } from "react";
import { useClientesStore } from "../../store/clientesStore";
import ClientesTable from "./ClientesTable";
import { deleteCliente } from "./clientesAPI";
import { FaPlus } from "react-icons/fa";
import "../../index.css";


const ClientesPage: React.FC = () => {
  const { clientes, search, setSearch, paginaActual, setPaginaActual, clientesPorPagina, totalPaginas, fetchClientes } = useClientesStore();

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleDeleteCliente = async (id: number) => {
    try {
      await deleteCliente(id);
      fetchClientes(); // Solo recarga la lista, sin mostrar notificación aquí
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    }
  };

  const clientesPaginados = clientes.slice(
    (paginaActual - 1) * clientesPorPagina,
    paginaActual * clientesPorPagina
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full max-w-xs"
        />
        <button className="btn-primary">
          <FaPlus /> Agregar Cliente
        </button>
      </div>
      <ClientesTable clientes={clientesPaginados} onEdit={() => {}} onDelete={handleDeleteCliente} onViewDetails={() => {}} />
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual(paginaActual - 1)}
          className="btn-secondary"
        >
          Anterior
        </button>
        <span className="text-lg font-semibold">Página {paginaActual} de {totalPaginas}</span>
        <button
          disabled={paginaActual >= totalPaginas}
          onClick={() => setPaginaActual(paginaActual + 1)}
          className="btn-secondary"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ClientesPage;
