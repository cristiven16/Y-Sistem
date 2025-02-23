import { render, screen, fireEvent } from "@testing-library/react";
import ClientesTable from "./ClientesTable";

const clientesMock = [
  {
    id: 1,
    nombre_razon_social: "Carlos Pérez",
    numero_documento: "123456",
    direccion: "Calle 123",
    email: "carlos@example.com",
    telefono1: "3201234567",
    telefono2: null,
    celular: "3201234567",
    whatsapp: "3201234567",
    cxc: 5000, // Simulando una cuenta por cobrar
  },
];

describe("ClientesTable", () => {
  test("Debe renderizar la tabla con clientes", () => {
    render(<ClientesTable clientes={clientesMock} onEdit={jest.fn()} onDelete={jest.fn()} onViewDetails={jest.fn()} />);
    expect(screen.getByText("Carlos Pérez")).toBeInTheDocument();
  });

  test("Debe abrir y cerrar el menú desplegable", () => {
    render(<ClientesTable clientes={clientesMock} onEdit={jest.fn()} onDelete={jest.fn()} onViewDetails={jest.fn()} />);
    const button = screen.getByRole("button", { name: /⋮/i });
    fireEvent.click(button);
    expect(screen.getByText("Editar")).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByText("Editar")).not.toBeInTheDocument();
  });

  test("Debe abrir y cerrar el modal de eliminación", () => {
    const handleDelete = jest.fn();
    render(<ClientesTable clientes={clientesMock} onEdit={jest.fn()} onDelete={handleDelete} onViewDetails={jest.fn()} />);
    
    fireEvent.click(screen.getByText("Eliminar"));
    expect(screen.getByText("¿Estás seguro de eliminar a Carlos Pérez?")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.queryByText("¿Estás seguro de eliminar a Carlos Pérez?")).not.toBeInTheDocument();
  });
});
