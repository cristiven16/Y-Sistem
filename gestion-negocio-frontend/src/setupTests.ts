import "@testing-library/jest-dom";
import { server } from "./mocks/server"; // Asegura que `msw` intercepte las peticiones

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
