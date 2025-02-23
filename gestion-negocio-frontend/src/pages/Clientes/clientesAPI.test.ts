import { rest } from "msw";
import { setupServer } from "msw/node";
import { getClientes, deleteCliente } from "./clientesAPI";

const server = setupServer(
  rest.get("http://localhost:8000/clientes", (req, res, ctx) => {
    return res(ctx.json([{ id: 1, nombre_razon_social: "Carlos Pérez", numero_documento: "123456" }]));
  }),
  rest.delete("http://localhost:8000/clientes/:id", (req, res, ctx) => {
    return res(ctx.status(200));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("clientesAPI", () => {
  test("Debe obtener la lista de clientes", async () => {
    const clientes = await getClientes();
    expect(clientes.length).toBe(1);
    expect(clientes[0].nombre_razon_social).toBe("Carlos Pérez");
  });

  test("Debe eliminar un cliente", async () => {
    await expect(deleteCliente(1)).resolves.toBeUndefined();
  });
});
