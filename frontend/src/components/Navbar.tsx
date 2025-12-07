import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { apiHelper } from "../api";

function linkClass(to: string, current: string) {
  const active = current === to || current.startsWith(to + "/");
  return `text-sm hover:text-blue-600 ${
    active ? "text-blue-600 font-semibold" : "text-slate-700"
  }`;
}

function getInitials(name: string | null, email: string | null): string {
  const source = (name && name.trim()) || (email && email.trim()) || "";
  if (!source) return "?";

  const parts = source.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source[0].toUpperCase();
}

// 👇 IMPORTANTE: ahora el backend puede devolver más roles
export type UserRole =
  | "CLIENTE"
  | "ADMIN"
  | "CONSTRUCTORA"
  | "FERRETERIA"
  | "BANCO";

type UserProfile = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
};

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { auth, logout, setAuth } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!auth.email;
  const isCliente = auth.role === "CLIENTE";
  const isAdmin = auth.role === "ADMIN";
  const isAliado =
    auth.role === "CONSTRUCTORA" ||
    auth.role === "FERRETERIA" ||
    auth.role === "BANCO";

  const initials = getInitials(auth.name, auth.email);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const goProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  // Cargar perfil desde /me la primera vez que haya email
  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.email) return;
      if (auth.name || auth.photoUrl) return;

      try {
        const url = `/me?email=${encodeURIComponent(auth.email)}`;
        const data = await apiHelper.get<UserProfile>(url);

        setAuth({
          email: data.email,
          role: data.role,
          name: data.name ?? null,
          phone: data.phone ?? null,
          photoUrl: data.avatarUrl ?? null,
        });
      } catch (err) {
        console.error("No fue posible actualizar perfil en Navbar:", err);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.email]);

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LOGO IZQUIERDA */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">Construct IA</span>
        </Link>

        {/* MENÚ CENTRO */}
        <div className="flex items-center gap-6">
          {/* ADMIN: solo menú administrativo */}
          {isAdmin ? (
            <>
              <Link
                to="/admin/solicitudes"
                className={linkClass("/admin/solicitudes", pathname)}
              >
                Solicitudes
              </Link>
              <Link
                to="/admin/services"
                className={linkClass("/admin/services", pathname)}
              >
                Servicios
              </Link>
              <Link
                to="/admin/quotes"
                className={linkClass("/admin/quotes", pathname)}
              >
                Cotizaciones
              </Link>
             <Link
                to="/admin/users"
                className={linkClass("/admin/users", pathname)}
              >
               Usuarios
              </Link>
            </>
          ) : isAliado ? (
            // 👇 Nuevo menú para CONSTRUCTORA / FERRETERIA / BANCO
            <>
              <Link
                to="/allied-quotes"
                className={linkClass("/allied-quotes", pathname)}
              >
                Cotizaciones asignadas
              </Link>
            </>
          ) : (
            // Menú normal para clientes / invitados
            <>
              <Link to="/" className={linkClass("/", pathname)}>
                Inicio
              </Link>
              <Link
                to="/projects"
                className={linkClass("/projects", pathname)}
              >
                Proyectos
              </Link>
              <Link to="/about" className={linkClass("/about", pathname)}>
                Nosotros
              </Link>
              <Link
                to="/contact"
                className={linkClass("/contact", pathname)}
              >
                Contacto
              </Link>
              <Link
                to="/register-request"
                className={linkClass("/register-request", pathname)}
              >
                Solicitud de registro
              </Link>

              {isCliente && (
                <Link
                  to="/my-prequotes"
                  className={linkClass("/my-prequotes", pathname)}
                >
                  Mis pre–cotizaciones
                </Link>
              )}
            </>
          )}
        </div>

        {/* LADO DERECHO: SESIÓN / AVATAR */}
        <div className="relative flex items-center gap-4">
          {!isLoggedIn && (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-slate-700 hover:text-blue-600"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full font-medium"
              >
                Registrarse
              </button>
            </>
          )}

          {isLoggedIn && (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700 hover:bg-slate-300 overflow-hidden"
                title="Ver menú de usuario"
              >
                {auth.photoUrl ? (
                  <img
                    src={auth.photoUrl}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-lg py-2 w-40 z-40">
                  <button
                    type="button"
                    onClick={goProfile}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Perfil
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

