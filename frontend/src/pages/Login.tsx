import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const token = await cred.user.getIdToken();
      localStorage.setItem("constructia_token", token);

      const emailValue = cred.user.email || "";
      setAuth({ email: emailValue, role: "CLIENTE" });

      alert("Inicio de sesión exitoso ✅");
      navigate("/");
    } catch (error: any) {
      let friendly = "No se pudo iniciar sesión. Verifica tus datos.";

      if (error?.code === "auth/user-not-found") {
        friendly = "No existe un usuario con ese correo.";
      } else if (error?.code === "auth/wrong-password") {
        friendly = "La contraseña es incorrecta.";
      } else if (error?.code === "auth/too-many-requests") {
        friendly = "Demasiados intentos. Intenta de nuevo más tarde.";
      }

      setErrorMsg(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center">

      {/* 🔹 Fondo con imagen */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920')",
        }}
      />

      {/* 🔹 Overlay oscuro para contraste */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 🔹 Formulario sobre la imagen */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30">

          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Iniciar sesión
          </h2>

          <p className="text-sm text-slate-600 mb-6">
            Accede con tus credenciales registradas.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Correo electrónico
              </label>
              <input
                type="email"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white/70"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white/70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-red-600 bg-red-50/80 border border-red-200 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition"
              disabled={loading}
            >
              {loading ? "Iniciando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-700">
            ¿Aún no tienes cuenta?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:underline font-medium"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

