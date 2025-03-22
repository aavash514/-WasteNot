import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { User, AuthContextType, RegisterData } from "@/lib/types";
import { ROUTES } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await res.json();
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await apiRequest("POST", "/api/auth/register", userData);
      const newUser = await res.json();
      
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate(ROUTES.LOGIN);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
