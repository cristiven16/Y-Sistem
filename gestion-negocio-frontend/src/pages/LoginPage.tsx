// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Si login es exitoso, navega a la ruta que quieras
      navigate("/");
    } catch (err: any) {
      console.error("Error en login", err);
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-6 rounded shadow w-80"
      >
        <h2 className="text-xl font-bold mb-4">Iniciar Sesión</h2>
        <div className="mb-3">
          <label className="block mb-1 font-semibold text-gray-700">
            Email
          </label>
          <input
            type="text"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@ejemplo.com"
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-semibold text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </div>
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
