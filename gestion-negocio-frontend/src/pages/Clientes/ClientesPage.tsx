import React, { useState, useEffect } from "react";
import { getClientes, deleteCliente } from "./clientesAPI";
import ClientesTable from "./ClientesTable";
import { Cliente } from "./clientesTypes";
import { FaPlus, FaSearch, FaFilter } from "react-icons/fa";

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 5;

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    const data = await getClientes();
    setClientes(data);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
      await deleteCliente(id);
      loadClientes();
    }
  };

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nombre_razon_social.toLowerCase().includes(search.toLowerCase()) ||
    cliente.numero_documento.includes(search)
  );

  const inicio = (paginaActual - 1) * clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(inicio, inicio + clientesPorPagina);

  return (
    <div className="p-4">
      {/* Encabezado con botón de nuevo cliente y filtros */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <FaPlus className="mr-2" /> Nuevo Cliente
        </button>
      </div>

      {/* Filtros básicos */}
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button onClick={() => setFiltrosAvanzados(!filtrosAvanzados)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          <FaFilter />
        </button>
      </div>

      {/* Filtros avanzados (se muestra solo si el usuario lo activa) */}
      {filtrosAvanzados && (
        <div className="p-4 border rounded mb-4">
          <p className="font-bold mb-2">Filtros Avanzados</p>
          <input type="text" placeholder="Buscar por dirección..." className="border p-2 rounded w-full mb-2" />
          <input type="text" placeholder="Buscar por email..." className="border p-2 rounded w-full mb-2" />
          <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
            <FaSearch className="mr-2" /> Aplicar Filtros
          </button>
        </div>
      )}

      {/* Tabla de Clientes */}
      <ClientesTable clientes={clientesPaginados} onEdit={() => {}} onDelete={handleDelete} />

      {/* Paginación */}
      <div className="flex justify-center mt-4">
        <button onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} className="mx-2 p-2 border rounded">
          ← Anterior
        </button>
        <button onClick={() => setPaginaActual(paginaActual + 1)} disabled={clientesPaginados.length < clientesPorPagina} className="mx-2 p-2 border rounded">
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default ClientesPage;
