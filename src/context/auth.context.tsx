import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { getMe } from "../services/auth.service";

// Tipado del usuario
type User = {
  userId: string;
  email: string;
  profileType: string;
  isAdmin: boolean;
};

// Tipo del contexto
type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  isLoading: boolean;
};

// Props del AuthProvider
type AuthProviderProps = {
  children: ReactNode;
};

// Creamos el contexto con valores por defecto
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  checkAuth: async () => {},
  isLoading: true,
});

// Creamos el provider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para consumir el contexto
export const useAuth = () => useContext(AuthContext);