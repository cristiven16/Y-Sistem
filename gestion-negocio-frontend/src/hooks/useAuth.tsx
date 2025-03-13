// src/hooks/useAuth.tsx

import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from "react";
import apiClient from "../api/axiosConfig";

interface AuthContextType {
  user: any;
  token: string | null;
  isLoading: boolean;               // <-- nuevo
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("access_token");
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cada vez que cambie 'token' (o la primera vez si existe)
    // consultamos /users/me y actualizamos 'user'
    if (token) {
      apiClient
        .get("/users/me")
        .then((resp) => {
          setUser(resp.data);
        })
        .catch((err) => {
          console.error("Error al cargar usuario actual:", err);
          setToken(null);
          setUser(null);
          localStorage.removeItem("access_token");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Si no hay token, ya no cargamos nada
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const resp = await apiClient.post("/auth/login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const { access_token } = resp.data;

    localStorage.setItem("access_token", access_token);
    setToken(access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
