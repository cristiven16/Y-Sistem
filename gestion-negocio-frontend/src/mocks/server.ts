import { rest } from "msw";
import { setupServer } from "msw/node";

export const server = setupServer(
  rest.get("http://localhost:8000/clientes", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([{ id: 1, nombre_razon_social: "Carlos Pérez", numero_documento: "123456" }])
    );
  }),

  rest.delete("http://localhost:8000/clientes/:id", (req, res, ctx) => {
    return res(ctx.status(200));
  })
);
