import { create } from "zustand";
import { getClientes } from "../api/clientesAPI";
import { Cliente } from "../pages/Clientes/clientesTypes";

interface ClientesState {
  clientes: Cliente[];
  search: string;
  paginaActual: number;
  clientesPorPagina: number;
  totalPaginas: number;
  setSearch: (search: string) => void;
  setPaginaActual: (pagina: number) => void;
  fetchClientes: () => Promise<void>;
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: [],
  search: "",
  paginaActual: 1,
  clientesPorPagina: 10,
  totalPaginas: 1,

  setSearch: (search) => {
    set({ search });
    get().fetchClientes();
  },

  setPaginaActual: (pagina) => set({ paginaActual: pagina }),

  fetchClientes: async () => {
    const { search, clientesPorPagina } = get();
    const data = await getClientes(search);
    set({
      clientes: data,
      totalPaginas: Math.ceil(data.length / clientesPorPagina),
      paginaActual: 1, // Reiniciar a la primera página al hacer una nueva búsqueda
    });
  },
}));