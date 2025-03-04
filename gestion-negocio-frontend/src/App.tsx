// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { isLoading } = useAuth(); // <-- Traemos isLoading
  const [isOpen, setIsOpen] = useState(true);

  // 1) Mientras isLoading => spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Cargando la App...</p>
        {/* Podrías usar un spinner si tienes una librería o un icono */}
      </div>
    );
  }

  // 2) Ya no está cargando => render normal
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen flex">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`${isOpen ? "ml-64" : "ml-16"} flex-1 p-4 overflow-auto`}>
          <AppRoutes />
        </div>
      </div>
    </Router>
  );
}

export default App;
