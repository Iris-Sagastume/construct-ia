// src/pages/admin/QuotesPage.tsx
import { useEffect, useState } from "react";
import { apiHelper } from "../../api";

type QuoteStatus = "BORRADOR" | "ENVIADA" | "ACEPTADA" | "RECHAZADA" | "PENDIENTE";

interface HouseInfo {
  tipoCasa: string;
  areaVaras: number;
  habitaciones: number;
  banos: number;
  departamento: string;
  municipio: string;
  colonia: string;
}

interface AdminQuote {
  id: number;
  ticket: string;
  clientName: string;
  contactEmail: string;
  total: number;
  status: QuoteStatus | string;
  createdAt: string;
  house: HouseInfo | null;
}

// Detalle de la pre–cotización (lo que necesitamos para el modal)
interface PreQuoteDetail {
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
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Estado para el modal de detalle
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<PreQuoteDetail | null>(null);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiHelper.get<AdminQuote[]>("/admin/quotes");
      setQuotes(data);
    } catch (err) {
      console.error(err);
      setError("No fue posible cargar las cotizaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const updateStatus = async (id: number, newStatus: QuoteStatus) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await apiHelper.put<AdminQuote>(`/admin/quotes/${id}`, {
        status: newStatus,
      });
      setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)));
    } catch (err) {
      console.error(err);
      setError("No fue posible actualizar la cotización.");
    } finally {
      setSaving(false);
    }
  };

  const removeQuote = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta cotización?")) return;
    try {
      setSaving(true);
      setError(null);
      await apiHelper.delete(`/admin/quotes/${id}`);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
      setError("No fue posible eliminar la cotización.");
    } finally {
      setSaving(false);
    }
  };

  // 👀 Cargar detalle por ticket y abrir modal
  const openDetail = async (ticket: string) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailError(null);
    try {
      setDetailLoading(true);
      const data = await apiHelper.get<PreQuoteDetail>(
        `/assistant/pre-quotes/${encodeURIComponent(ticket)}`
      );
      setDetail(data);
    } catch (err) {
      console.error(err);
      setDetailError("No fue posible cargar el detalle de la pre–cotización.");
    } finally {
      setDetailLoading(false);
    }
  };

  const renderHouseSummary = (q: AdminQuote) => {
    if (!q.house) return "-";
    const h = q.house;
    return `${h.tipoCasa} · ${h.habitaciones} hab · ${h.banos} baños · ${h.colonia}, ${h.municipio}`;
  };

  return (
    <main className="max-w-6xl mx-auto px-4 mt-10 mb-16">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
        Cotizaciones
      </h1>
      <p className="text-sm text-slate-500 mb-6 max-w-3xl">
        Aquí puedes revisar las pre–cotizaciones generadas por los clientes,
        consultar el detalle del ticket, cambiar el estado o eliminar registros.
      </p>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Tabla de resultados con estilo tipo tarjetas */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-100 divide-y divide-slate-100">
        {loading ? (
          <div className="px-6 py-6 text-center text-slate-500 text-sm">
            Cargando cotizaciones...
          </div>
        ) : quotes.length === 0 ? (
          <div className="px-6 py-6 text-center text-slate-500 text-sm">
            No hay cotizaciones registradas por el momento.
          </div>
        ) : (
          quotes.map((q) => (
            <div
              key={q.id}
              className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* IZQUIERDA: info principal */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900 text-sm md:text-base">
                    {q.clientName}
                  </span>
                  <span className="text-[11px] md:text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Ticket {q.ticket}
                  </span>
                  <span className="text-[11px] md:text-xs inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5">
                    {q.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  {q.contactEmail} · {renderHouseSummary(q)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Creada el{" "}
                  {new Date(q.createdAt).toLocaleString("es-HN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  · Monto estimado:{" "}
                  <span className="font-semibold text-slate-700">
                    L.{" "}
                    {q.total.toLocaleString("es-HN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
              </div>

              {/* DERECHA: acciones */}
              <div className="flex flex-wrap gap-2 text-xs justify-end">
                <button
                  type="button"
                  onClick={() => openDetail(q.ticket)}
                  className="px-3 py-1 rounded-full border border-slate-400 text-slate-700 hover:bg-slate-50"
                >
                  Ver detalle
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => updateStatus(q.id, "ENVIADA")}
                  className="px-3 py-1 rounded-full border border-sky-500 text-sky-600 hover:bg-sky-50 disabled:opacity-60"
                >
                  Enviar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => updateStatus(q.id, "ACEPTADA")}
                  className="px-3 py-1 rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50 disabled:opacity-60"
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => updateStatus(q.id, "RECHAZADA")}
                  className="px-3 py-1 rounded-full border border-amber-500 text-amber-600 hover:bg-amber-50 disabled:opacity-60"
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => removeQuote(q.id)}
                  className="px-3 py-1 rounded-full border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* =====================================================
          MODAL DETALLE PRE–COTIZACIÓN
      ===================================================== */}
      {detailOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4">
          <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header modal */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm md:text-base font-semibold text-slate-900">
                Detalle de pre–cotización
              </h2>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="px-5 py-4 text-sm">
              {detailLoading ? (
                <p className="text-slate-500">Cargando detalle...</p>
              ) : detailError ? (
                <p className="text-red-600">{detailError}</p>
              ) : !detail ? (
                <p className="text-slate-500">
                  No se encontró información para este ticket.
                </p>
              ) : (
                <>
                  {/* Resumen superior */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">
                        Ticket
                      </p>
                      <p className="font-mono text-sm font-semibold">
                        {detail.ticket}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">
                        Fecha
                      </p>
                      <p className="text-sm">
                        {new Date(detail.createdAt).toLocaleString("es-HN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">
                        Monto estimado
                      </p>
                      <p className="text-base font-bold text-blue-600">
                        L. {detail.estimatedCostLps.toLocaleString("es-HN")}
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-200 mb-4" />

                  {/* Datos de referencia + contacto */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Datos de referencia */}
                    <div>
                      <h3 className="text-[11px] font-semibold text-slate-500 uppercase mb-2">
                        Datos de referencia
                      </h3>
                      <ul className="space-y-1 text-slate-700 text-sm">
                        <li>
                          <strong>Constructora:</strong>{" "}
                          {detail.builder || "Sin preferencia"}
                        </li>
                        <li>
                          <strong>Ferretería:</strong>{" "}
                          {detail.ferreteria || "Sin preferencia"}
                        </li>
                        <li>
                          <strong>Banco:</strong>{" "}
                          {detail.bankName || "Sin preferencia"}
                          {detail.bankRate
                            ? ` (tasa ${detail.bankRate.toFixed(2)}%)`
                            : ""}
                        </li>
                      </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                      <h3 className="text-[11px] font-semibold text-slate-500 uppercase mb-2">
                        Contacto
                      </h3>
                      <ul className="space-y-1 text-slate-700 text-sm">
                        <li>
                          <strong>Correo:</strong> {detail.contactEmail}
                        </li>
                        <li>
                          <strong>Teléfono:</strong> {detail.contactPhone}
                        </li>
                        <li>
                          <strong>Modalidad:</strong>{" "}
                          {detail.contactMode === "PRESENCIAL"
                            ? `Presencial${
                                detail.contactPlace
                                  ? ` (${detail.contactPlace})`
                                  : ""
                              }`
                            : `Virtual (${
                                detail.contactVirtualOption || "WhatsApp"
                              })`}
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

