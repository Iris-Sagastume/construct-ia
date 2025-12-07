import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type UserRole =
  | "CLIENTE"
  | "ADMIN"
  | "CONSTRUCTORA"
  | "FERRETERIA"
  | "BANCO";

type AuthState = {
  email: string | null;
  role: UserRole | null;
  name: string | null;
  phone: string | null;
  photoUrl: string | null;
};

type AuthContextType = {
  auth: AuthState;
  setAuth: (
    next: Partial<AuthState> | ((prev: AuthState) => Partial<AuthState>)
  ) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_STATE: AuthState = {
  email: null,
  role: null,
  name: null,
  phone: null,
  photoUrl: null,
};

const STORAGE_KEY = "constructia_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuthState] = useState<AuthState>(INITIAL_STATE);

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthState;
        setAuthState({ ...INITIAL_STATE, ...parsed });
        return;
      }

      // Compatibilidad con claves antiguas (si las tenías)
      const email = localStorage.getItem("constructia_email");
      const role = (localStorage.getItem("constructia_role") as Role) ?? null;
      const name = localStorage.getItem("constructia_name");

      setAuthState({
        ...INITIAL_STATE,
        email,
        role,
        name,
      });
    } catch {
      setAuthState(INITIAL_STATE);
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));

    // Compatibilidad con claves antiguas
    if (auth.email) localStorage.setItem("constructia_email", auth.email);
    else localStorage.removeItem("constructia_email");

    if (auth.role) localStorage.setItem("constructia_role", auth.role);
    else localStorage.removeItem("constructia_role");

    if (auth.name) localStorage.setItem("constructia_name", auth.name);
    else localStorage.removeItem("constructia_name");
  }, [auth]);

  const setAuth = (
    next: Partial<AuthState> | ((prev: AuthState) => Partial<AuthState>)
  ) => {
    setAuthState((prev) => {
      const patch = typeof next === "function" ? next(prev) : next;
      return { ...prev, ...patch };
    });
  };

  const logout = () => {
    setAuthState(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("constructia_token");
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

