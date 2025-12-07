// src/pages/MyPreQuotes.tsx
import { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

type PreQuote = {
  id: number;
  ticket: string;
  createdAt: string;
  estimatedCostLps: number;
  builder: string | null;
  ferreteria: string | null;
  bankName: string | null;
  bankRate: number | null;
  contactEmail: string;
  contactPhone: string;
  contactMode: string;
  contactPlace: string | null;
  contactVirtualOption: string | null;
  status: string;
  houseDesign?:
    | {
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
      }
    | null;
};

export default function MyPreQuotes() {
  const { auth } = useAuth();

  const [ticket, setTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PreQuote | null>(null);

  // 🔹 Tickets del usuario
  const [myTickets, setMyTickets] = useState<PreQuote[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const isLoggedIn = !!localStorage.getItem("constructia_token");

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "ACEPTADA":
        return "bg-emerald-100 text-emerald-700 border border-emerald-300";
      case "ENVIADA":
        return "bg-sky-100 text-sky-700 border border-sky-300";
      case "RECHAZADA":
        return "bg-rose-100 text-rose-700 border border-rose-300";
      default:
        // PENDIENTE u otros
        return "bg-amber-100 text-amber-700 border border-amber-300";
    }
  };

  // =====================================================
  //   CARGAR TICKETS DEL USUARIO
  // =====================================================
  const loadMyTickets = async () => {
    if (!isLoggedIn || !auth.email) return;

    try {
      setLoadingTickets(true);
      const token = localStorage.getItem("constructia_token");

      const { data } = await api.get<PreQuote[]>(
        "/assistant/pre-quotes",
        {
          params: { email: auth.email },
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      setMyTickets(data);
    } catch (err) {
      console.error("Error cargando tickets del usuario:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadMyTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.email, isLoggedIn]);

  // =====================================================
  //   BUSCAR POR TICKET
  // =====================================================
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!ticket.trim()) {
      setError("Por favor ingrese un número de ticket.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("constructia_token");

      const { data } = await api.get<PreQuote>(
        `/assistant/pre-quotes/${encodeURIComponent(ticket.trim())}`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      setResult(data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError("No se encontró ninguna pre–cotización con ese ticket.");
      } else if (err?.response?.status === 401) {
        setError("Debe iniciar sesión para consultar sus pre–cotizaciones.");
      } else {
        setError("Ocurrió un error al buscar la pre–cotización.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result?.houseDesign?.id) return;
    try {
      const response = await api.get(
        `/ai/house-design/${result.houseDesign.id}/pdf`,
        { responseType: "blob" }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `cotizacion_${result.ticket}.pdf`;
      link.click();

      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      setError("Hubo un problema al descargar el PDF.");
    }
  };

  return (
    <main className="w-full bg-white pb-16">
      {/* =====================================================
           HERO
      ===================================================== */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="relative grid md:grid-cols-2 overflow-hidden rounded-2xl shadow-xl bg-gradient-to-r from-slate-900 to-slate-800">
          {/* Texto */}
          <div className="p-8 md:p-10 text-white flex flex-col justify-center">
            <span className="text-xs tracking-wide text-blue-300 uppercase">
              Seguimiento de proyectos
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-1 leading-tight">
              Consulta tus <span className="text-blue-400">pre–cotizaciones</span>
            </h1>
            <p className="mt-3 text-slate-200 max-w-md">
              Revisa el detalle de las viviendas que ya has precotizado con
              Construct IA: montos estimados, datos de contacto y resumen del
              diseño generado por el asistente.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="#buscar-ticket"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Buscar por ticket
              </a>

              <button
                type="button"
                onClick={() => (window as any).openArchitectChat?.()}
                className="border border-white/70 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Generar nueva cotización
              </button>
            </div>
          </div>

          {/* Imagen */}
          <div className="h-64 md:h-full">
            <img
              src="/images/cotizaciones/cotizacion-hero.jpg"
              alt="Equipo de construcción"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-900/60 to-transparent" />
        </div>
      </section>

      {/* =====================================================
           BUSCADOR DE TICKET
      ===================================================== */}
      <section id="buscar-ticket" className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-3">
          Consultar pre–cotización por ticket
        </h2>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            list="tickets-list"
            type="text"
            placeholder="Ejemplo: TCK-123456"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
          />

          {/* 👉 Lista de tickets del usuario */}
          <datalist id="tickets-list">
            {myTickets.map((t) => (
              <option key={t.id} value={t.ticket} />
            ))}
          </datalist>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 text-white px-5 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {loading ? "Buscando..." : "Buscar por ticket"}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-2">
          Si aún no tiene un ticket, puede generar una nueva pre–cotización con
          nuestro asistente virtual.
        </p>

        {/* Resumen de tickets del usuario */}
        <div className="mt-4">
          {loadingTickets ? (
            <p className="text-xs text-slate-500">
              Cargando tus tickets recientes...
            </p>
          ) : myTickets.length === 0 ? (
            <p className="text-xs text-slate-500">
              Aún no has generado pre–cotizaciones con tu cuenta.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {myTickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTicket(t.ticket)}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <span className="font-mono">{t.ticket}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${statusBadgeClass(
                      t.status
                    )}`}
                  >
                    {t.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </section>

      {/* =====================================================
           RESULTADO
      ===================================================== */}
      {result && (
        <section className="max-w-6xl mx-auto px-4 mt-6">
          <div className="rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden text-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Ticket
                </p>
                <p className="font-mono font-semibold">{result.ticket}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Fecha
                </p>
                <p>{new Date(result.createdAt).toLocaleString("es-HN")}</p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Monto estimado
                </p>
                <p className="text-lg font-bold text-blue-600">
                  L. {result.estimatedCostLps.toLocaleString("es-HN")}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Estado
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs rounded-full ${statusBadgeClass(
                    result.status
                  )}`}
                >
                  {result.status}
                </span>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="px-6 py-5 grid md:grid-cols-2 gap-8">
              {/* Datos de referencia */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs text-slate-500 uppercase font-semibold">
                    Datos de referencia
                  </h3>
                  <ul className="mt-2 space-y-1 text-slate-700">
                    <li>
                      <strong>Constructora:</strong>{" "}
                      {result.builder || "Sin preferencia"}
                    </li>
                    <li>
                      <strong>Ferretería:</strong>{" "}
                      {result.ferreteria || "Sin preferencia"}
                    </li>
                    <li>
                      <strong>Banco:</strong> {result.bankName || "Sin preferencia"}
                      {result.bankRate
                        ? ` (tasa ${result.bankRate.toFixed(2)}%)`
                        : ""}
                    </li>
                  </ul>
                </div>

                {result.houseDesign && (
                  <div>
                    <h3 className="text-xs text-slate-500 uppercase font-semibold">
                      Diseño de la vivienda
                    </h3>
                    <ul className="mt-2 space-y-1 text-slate-700">
                      <li>
                        <strong>Tipo:</strong> {result.houseDesign.tipoCasa}
                      </li>
                      <li>
                        <strong>Área:</strong> {result.houseDesign.areaVaras}{" "}
                        varas²
                      </li>
                      <li>
                        <strong>Habitaciones:</strong>{" "}
                        {result.houseDesign.habitaciones}
                      </li>
                      <li>
                        <strong>Baños:</strong> {result.houseDesign.banos}
                      </li>
                      <li>
                        <strong>Ubicación:</strong>{" "}
                        {`${result.houseDesign.colonia}, ${result.houseDesign.municipio}, ${result.houseDesign.departamento}`}
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Contacto + botón PDF */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs text-slate-500 uppercase font-semibold">
                    Contacto
                  </h3>
                  <ul className="mt-2 space-y-1 text-slate-700">
                    <li>
                      <strong>Correo:</strong> {result.contactEmail}
                    </li>
                    <li>
                      <strong>Teléfono:</strong> {result.contactPhone}
                    </li>
                    <li>
                      <strong>Modalidad:</strong>{" "}
                      {result.contactMode === "PRESENCIAL"
                        ? `Presencial ${
                            result.contactPlace
                              ? `en ${result.contactPlace}`
                              : ""
                          }`
                        : `Virtual (${result.contactVirtualOption || "WhatsApp"})`}
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100 transition"
                >
                  Descargar PDF de la pre–cotización
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

