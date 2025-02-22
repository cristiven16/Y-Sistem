import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ClientesPage from "../pages/Clientes/ClientesPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/clientes" element={<ClientesPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
