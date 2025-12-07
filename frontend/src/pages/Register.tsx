import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
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
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Guardar nombre en Firebase Auth
      await updateProfile(cred.user, { displayName: name });

      const token = await cred.user.getIdToken();
      localStorage.setItem("constructia_token", token);

      setAuth({
        email: cred.user.email || "",
        role: "CLIENTE",
        name: name,
      });

      alert("Cuenta creada exitosamente 🎉");
      navigate("/");
    } catch (error: any) {
      let msg = "No se pudo crear la cuenta.";

      if (error.code === "auth/email-already-in-use") {
        msg = "Este correo ya está registrado.";
      } else if (error.code === "auth/weak-password") {
        msg = "La contraseña debe tener al menos 6 caracteres.";
      }

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center">

      {/* 🔹 Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1920')",
        }}
      />

      {/* 🔹 Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 🔹 Contenido */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30">

          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Registrarse</h2>
          <p className="text-sm text-slate-600 mb-6">
            Crea tu cuenta de CLIENTE para dar seguimiento a tus pre–cotizaciones.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Nombre completo
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white/70"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            {/* Errores */}
            {errorMsg && (
              <p className="text-sm text-red-600 bg-red-50/80 border border-red-200 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}

            {/* Botón */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-lg shadow-md transition"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          {/* Ir al login */}
          <p className="mt-5 text-center text-sm text-slate-700">
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
