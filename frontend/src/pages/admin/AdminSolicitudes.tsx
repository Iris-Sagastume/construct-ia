import { useEffect, useState } from "react";
import { apiHelper } from "../../api";

type RequestType = "CONSTRUCTORA" | "FERRETERIA" | "BANCO";

type Solicitud = {
  id: number;
  type: RequestType;
  name: string;
  email: string;
  status: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  interestRate: number | null;
  createdAt: string;
};

export default function AdminSolicitudes() {
  const [items, setItems] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // carga inicial
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiHelper.get<Solicitud[]>("/admin/solicitudes");
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("No fue posible cargar las solicitudes.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateStatus = async (id: number, status: Solicitud["status"]) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await apiHelper.put<Solicitud>(
        `/admin/solicitudes/${id}`,
        { status }
      );
      setItems((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
      );
    } catch (err) {
      console.error(err);
      setError("No fue posible actualizar la solicitud.");
    } finally {
      setSaving(false);
    }
  };

  const removeSolicitud = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta solicitud?")) return;
    try {
      setSaving(true);
      setError(null);
      await apiHelper.delete<void>(`/admin/solicitudes/${id}`);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      setError("No fue posible eliminar la solicitud.");
    } finally {
      setSaving(false);
    }
  };

  const labelTipo = (t: RequestType) => {
    if (t === "CONSTRUCTORA") return "Constructora";
    if (t === "FERRETERIA") return "Ferretería";
    return "Banco";
  };

  const badgeStatusClass = (status: Solicitud["status"]) => {
    if (status === "APROBADA")
      return "bg-green-50 text-green-700 border-green-200";
    if (status === "RECHAZADA")
      return "bg-red-50 text-red-700 border-red-200";
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  return (
    <main className="max-w-6xl mx-auto px-4 mt-10 mb-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Solicitudes de registro
        </h1>
        <p className="mt-3 text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
          Aquí puedes revisar las solicitudes de registro de constructoras,
          ferreterías y bancos aliados. Aprueba, edita o elimina cada
          solicitud según corresponda.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm">Cargando solicitudes...</p>
        ) : items.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No hay solicitudes registradas por el momento.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((s) => (
              <div
                key={s.id}
                className="border border-slate-200 rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {s.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full border font-medium text-slate-600">
                      {labelTipo(s.type)}
                    </span>
                    <span
                      className={
                        "text-xs px-2 py-0.5 rounded-full border font-medium " +
                        badgeStatusClass(s.status)
                      }
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {s.email} ·{" "}
                    {s.interestRate != null
                      ? `Tasa: ${s.interestRate}%`
                      : "Sin tasa asociada"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Creada el{" "}
                    {new Date(s.createdAt).toLocaleString("es-HN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => updateStatus(s.id, "APROBADA")}
                    className="px-3 py-1 rounded-full border border-green-500 text-green-600 hover:bg-green-50 disabled:opacity-60"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => updateStatus(s.id, "RECHAZADA")}
                    className="px-3 py-1 rounded-full border border-yellow-500 text-yellow-600 hover:bg-yellow-50 disabled:opacity-60"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => removeSolicitud(s.id)}
                    className="px-3 py-1 rounded-full border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
