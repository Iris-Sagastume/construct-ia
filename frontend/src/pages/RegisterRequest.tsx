import { useState, useEffect } from "react";
import { apiHelper } from "../api";
import { useAuth } from "../context/AuthContext";

type TipoSolicitud = "CONSTRUCTORA" | "FERRETERIA" | "BANCO";

interface Solicitud {
  id: number;
  tipo: string;
  nombre: string;
  email: string;
  tasaInteres?: number | null;
  estado: string;
  createdAt: string;
}

export default function RegisterRequest() {
  const { auth } = useAuth();

  const [tipo, setTipo] = useState<TipoSolicitud | null>(null);
  const [nombre, setNombre] = useState("");
  const [tasaInteres, setTasaInteres] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // 🔥 Solicitudes del usuario
  const [mySolicitudes, setMySolicitudes] = useState<Solicitud[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);

  // 👉 ¿Tiene alguna solicitud aprobada?
  const hasApproved = mySolicitudes.some((s) => s.estado === "APROBADA");
  const formDisabled = loading || hasApproved;

  // 🔥 Cargar solicitudes del usuario al entrar
  const loadMySolicitudes = async () => {
    if (!auth.email) return;

    try {
      setLoadingSolicitudes(true);
      const data = await apiHelper.get<Solicitud[]>(
        `/solicitudes/my?email=${auth.email}`
      );
      setMySolicitudes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  useEffect(() => {
    loadMySolicitudes();
  }, [auth.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    // 🚫 Bloqueo si ya tiene una solicitud aprobada
    if (hasApproved) {
      setError(
        "Ya tienes una solicitud aprobada. Si necesitas cambios, contáctanos por soporte."
      );
      return;
    }

    if (!tipo) {
      setError("Selecciona una opción de registro.");
      return;
    }

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!auth.email) {
      setError("Debes iniciar sesión para enviar la solicitud.");
      return;
    }

    if (tipo === "BANCO" && !tasaInteres.trim()) {
      setError("Para banco debes indicar la tasa de interés.");
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        tipo,
        nombre: nombre.trim(),
        email: auth.email,
      };

      if (tipo === "BANCO") {
        payload.tasaInteres = Number(tasaInteres.replace(",", "."));
      }

      await apiHelper.post("/solicitudes", payload);

      setOk("Tu solicitud ha sido registrada.");
      setNombre("");
      setTasaInteres("");
      setTipo(null);

      // 🔥 Recargar solicitudes del usuario
      loadMySolicitudes();
    } catch (err) {
      console.error(err);
      setError("No fue posible enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const optionClass = (value: TipoSolicitud) =>
    `flex-1 border rounded-xl px-4 py-3 cursor-pointer text-sm ${
      tipo === value
        ? "border-blue-600 bg-blue-50 text-blue-700"
        : "border-slate-200 text-slate-700 hover:border-blue-300"
    } ${hasApproved ? "opacity-60 cursor-not-allowed" : ""}`;

  const badgeClass = (estado: string) => {
    switch (estado) {
      case "APROBADA":
        return "bg-green-100 text-green-700 border border-green-300";
      case "RECHAZADA":
        return "bg-red-100 text-red-700 border border-red-300";
      default:
        return "bg-amber-100 text-amber-700 border border-amber-300";
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* ENCABEZADO */}
      <section className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Solicitud de Registro
        </h1>
        <p className="mt-3 text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
          Completa la información y revisa el estado de tus solicitudes enviadas.
        </p>
      </section>

      {/* 🔔 ESTADO GENERAL ANTES DEL FORMULARIO */}
      {hasApproved && (
        <section className="mb-6">
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <p className="font-semibold">
              Ya tienes al menos una solicitud aprobada.
            </p>
            <p className="mt-1">
              Ya no es necesario enviar nuevas solicitudes. Si necesitas
              actualizar datos de tu registro, ponte en contacto con el equipo
              de Construct IA.
            </p>
          </div>
        </section>
      )}

      {/* FORMULARIO */}
      <section className="bg-white border border-slate-100 rounded-3xl shadow-lg px-6 py-8 md:px-10 md:py-10">
        {error && (
          <div className="mb-4 bg-red-50 text-red-800 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {ok && (
          <div className="mb-4 bg-green-50 text-green-800 px-4 py-2 rounded-md text-sm">
            {ok}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Opciones */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              ¿Cómo deseas registrarte?
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="button"
                disabled={hasApproved}
                className={optionClass("CONSTRUCTORA")}
                onClick={() => !hasApproved && setTipo("CONSTRUCTORA")}
              >
                ¿Registrarte como constructora?
              </button>
              <button
                type="button"
                disabled={hasApproved}
                className={optionClass("FERRETERIA")}
                onClick={() => !hasApproved && setTipo("FERRETERIA")}
              >
                ¿Registrarte como ferretería?
              </button>
              <button
                type="button"
                disabled={hasApproved}
                className={optionClass("BANCO")}
                onClick={() => !hasApproved && setTipo("BANCO")}
              >
                ¿Registrarte como banco?
              </button>
            </div>
          </div>

          {/* Campos */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre ({tipo === "BANCO" ? "del banco" : "de la empresa"})
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={hasApproved}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                placeholder={
                  tipo === "BANCO" ? "Ej: Banco XYZ" : "Ej: Constructora ABC"
                }
              />
            </div>

            {tipo === "BANCO" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tasa de interés (%)
                </label>
                <input
                  type="text"
                  value={tasaInteres}
                  onChange={(e) => setTasaInteres(e.target.value)}
                  disabled={hasApproved}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
                  placeholder="Ej: 9.5"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                disabled
                value={auth.email || ""}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={formDisabled}
              className="rounded-full bg-blue-600 text-white px-6 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar solicitud"}
            </button>
          </div>
        </form>
      </section>

      {/* 🔥 SECCIÓN: MIS SOLICITUDES */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Mis solicitudes enviadas
        </h2>

        {loadingSolicitudes ? (
          <p className="text-slate-500 text-sm">Cargando solicitudes...</p>
        ) : mySolicitudes.length === 0 ? (
          <p className="text-slate-500 text-sm">Aún no has enviado solicitudes.</p>
        ) : (
          <div className="space-y-4">
            {mySolicitudes.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{s.nombre}</h3>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${badgeClass(
                      s.estado
                    )}`}
                  >
                    {s.estado}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mt-1">
                  Tipo: <strong>{s.tipo}</strong>
                </p>

                {s.tasaInteres && (
                  <p className="text-sm text-slate-600">Tasa: {s.tasaInteres}%</p>
                )}

                <p className="text-xs text-slate-400 mt-2">
                  Registrado el {new Date(s.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
