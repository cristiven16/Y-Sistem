import { render, screen, fireEvent } from "@testing-library/react";
import ClientesPage from "./ClientesPage";

// ✅ Mock correcto de Zustand
jest.mock("../../store/clientesStore", () => ({
  __esModule: true,
  useClientesStore: jest.fn(() => ({
    clientes: [{ id: 1, nombre_razon_social: "Carlos Pérez", numero_documento: "123456" }],
    search: "",
    setSearch: jest.fn(),
    paginaActual: 1,
    setPaginaActual: jest.fn(),
    clientesPorPagina: 10,
    totalPaginas: 1,
    fetchClientes: jest.fn(),
  })),
}));

describe("ClientesPage", () => {
  test("Debe renderizar la lista de clientes", () => {
    render(<ClientesPage />);
    expect(screen.getByText("Carlos Pérez")).toBeInTheDocument();
  });

  test("Debe permitir escribir en la barra de búsqueda", () => {
    render(<ClientesPage />);
    const input = screen.getByPlaceholderText("Buscar cliente...");
    fireEvent.change(input, { target: { value: "Maria" } });
    expect(input).toHaveValue("Maria");
  });
});
