import { BrowserRouter as Router } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes";

function App() {
  // Estado para controlar si la sidebar está abierta o cerrada
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Router>
      <div className="bg-gray-100 min-h-screen flex">
        {/* Sidebar fijo a la izquierda */}
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

        {/* Contenedor principal:
            Aplica margin-left distinto según isOpen (64 vs 16) */}
        <div
          className={`
            flex-1 
            transition-all 
            duration-300
            ${isOpen ? "ml-64" : "ml-16"} 
            p-4
            overflow-auto
          `}
        >
          <AppRoutes />
        </div>
      </div>
    </Router>
  );
}

export default App;
