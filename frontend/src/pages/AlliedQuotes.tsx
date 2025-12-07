// src/pages/AlliedQuotes.tsx
import { useEffect, useState } from "react";
import { apiHelper } from "../api";
import { useAuth } from "../context/AuthContext";

type HouseDesign = {
  id: number;
  tipoCasa: string;
  areaVaras: number;
  habitaciones: number;
  banos: number;
  departamento: string;
  municipio: string;
  colonia: string;
  piscina: boolean;
  estimatedCostUsd: number;
};

type CompanyType = "CONSTRUCTORA" | "FERRETERIA" | "BANCO";

type AlliedPreQuote = {
  ticket: string;
  createdAt: string;
  status: string;
  estimatedCostLps: number;
  companyName: string;
  companyType: CompanyType;
  houseDesign: HouseDesign | null;
};

export default function AlliedQuotes() {
  const { auth } = useAuth();
  const [quotes, setQuotes] = useState<AlliedPreQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const email = auth.email;

  const loadData = async () => {
    if (!email) {
      setError("Debes iniciar sesión para ver tus cotizaciones.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiHelper.get<AlliedPreQuote[]>(
        `/allies/pre-quotes?email=${encodeURIComponent(email)}`
      );

      setQuotes(data);
    } catch (err) {
      console.error(err);
      setError("No fue posible cargar las cotizaciones asignadas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const renderCompanyLabel = (type?: CompanyType, name?: string) => {
    if (!type || !name) return "";
    switch (type) {
      case "CONSTRUCTORA":
        return `Constructora: ${name}`;
      case "FERRETERIA":
        return `Ferretería: ${name}`;
      case "BANCO":
        return `Banco: ${name}`;
      default:
        return name;
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Encabezado */}
      <section className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Cotizaciones asignadas
        </h1>
        <p className="mt-3 text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
          Aquí puedes visualizar las pre–cotizaciones donde tu empresa ha sido
          seleccionada como constructora, ferretería o banco aliado. Solo se
          muestra el diseño de la vivienda y el estado de cada ticket.
        </p>
      </section>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Cargando cotizaciones…</p>
      ) : quotes.length === 0 ? (
        <p className="text-sm text-slate-500">
          No se encontraron cotizaciones asignadas a tu empresa. Asegúrate de
          tener una solicitud de registro aprobada como constructora, ferretería
          o banco.
        </p>
      ) : (
        <section className="space-y-4">
          {quotes.map((q) => (
            <article
              key={q.ticket}
              className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden text-sm"
            >
              {/* Header de la tarjeta */}
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Ticket
                  </p>
                  <p className="font-mono text-sm font-semibold">
                    {q.ticket}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Fecha
                  </p>
                  <p className="text-sm">
                    {new Date(q.createdAt).toLocaleString("es-HN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Monto estimado
                  </p>
                  <p className="text-base font-bold text-blue-600">
                    L. {q.estimatedCostLps.toLocaleString("es-HN")}
                  </p>
                </div>
              </div>

              {/* Cuerpo: solo diseño + estado */}
              <div className="px-5 py-4 grid md:grid-cols-2 gap-6">
                {/* Diseño de la vivienda */}
                <div>
                  <h3 className="text-[11px] font-semibold text-slate-500 uppercase mb-2">
                    Diseño de la vivienda
                  </h3>

                  {q.houseDesign ? (
                    <ul className="space-y-1 text-slate-700">
                      <li>
                        <strong>Tipo:</strong> {q.houseDesign.tipoCasa}
                      </li>
                      <li>
                        <strong>Área:</strong> {q.houseDesign.areaVaras} varas
                        <sup>2</sup>
                      </li>
                      <li>
                        <strong>Habitaciones:</strong>{" "}
                        {q.houseDesign.habitaciones}
                      </li>
                      <li>
                        <strong>Baños:</strong> {q.houseDesign.banos}
                      </li>
                      <li>
                        <strong>Ubicación:</strong>{" "}
                        {`${q.houseDesign.colonia}, ${q.houseDesign.municipio}, ${q.houseDesign.departamento}`}
                      </li>
                      <li>
                        <strong>Piscina:</strong>{" "}
                        {q.houseDesign.piscina ? "Sí" : "No"}
                      </li>
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-sm">
                      No hay información de diseño asociada a este ticket.
                    </p>
                  )}
                </div>

                {/* Estado + info de empresa */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[11px] font-semibold text-slate-500 uppercase mb-2">
                      Empresa aliada
                    </h3>
                    <p className="text-slate-700">
                      {renderCompanyLabel(q.companyType, q.companyName)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-semibold text-slate-500 uppercase mb-2">
                      Estado de la pre–cotización
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        q.status === "ACEPTADA"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : q.status === "RECHAZADA"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : q.status === "ENVIADA"
                          ? "bg-sky-50 text-sky-700 border border-sky-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Esta vista es solo de lectura. La gestión del estado de la
                    pre–cotización se realiza desde el panel de administración.
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
