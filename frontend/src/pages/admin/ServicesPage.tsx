// src/pages/admin/ServicesPage.tsx
import { useEffect, useState } from "react";
import { apiHelper } from "../../api";

type RequestType = "CONSTRUCTORA" | "FERRETERIA" | "BANCO";
type SolicitudStatus = "PENDIENTE" | "APROBADA" | "RECHAZADA";

interface Aliado {
  id: number;
  type: RequestType;
  name: string;
  email: string;
  status: SolicitudStatus | string;
  interestRate: number | null;
  createdAt: string;
}

export default function ServicesPage() {
  const [items, setItems] = useState<Aliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Reutilizamos el endpoint de solicitudes del admin
        const data = await apiHelper.get<Aliado[]>("/admin/solicitudes");

        // Solo aprobadas
        const aprobadas = data.filter((s) => s.status === "APROBADA");
        setItems(aprobadas);
      } catch (err) {
        console.error(err);
        setError("No fue posible cargar los servicios aliados.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const constructoras = items.filter((i) => i.type === "CONSTRUCTORA");
  const ferreterias = items.filter((i) => i.type === "FERRETERIA");
  const bancos = items.filter((i) => i.type === "BANCO");

  const formatFecha = (createdAt: string) =>
    new Date(createdAt).toLocaleString("es-HN", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const formatTasa = (interestRate: number | null) =>
    interestRate != null ? `${interestRate.toFixed(2)}%` : "No especificada";

  const Section = ({
    title,
    subtitle,
    data,
  }: {
    title: string;
    subtitle: string;
    data: Aliado[];
  }) => (
    <section className="mb-6">
      <h2 className="text-base md:text-lg font-semibold text-slate-900">
        {title}
      </h2>
      <p className="text-xs text-slate-500 mb-3">{subtitle}</p>

      {data.length === 0 ? (
        <p className="text-sm text-slate-500">No hay registros aprobados.</p>
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <div
              key={a.id}
              className="border border-slate-200 rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {a.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-green-50 text-green-700 border-green-200">
                    APROBADO
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{a.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registrado el {formatFecha(a.createdAt)}
                </p>
              </div>

              {a.type === "BANCO" && (
                <div className="text-xs text-slate-600 md:text-right">
                  <p className="font-medium">Tasa de interés referencial</p>
                  <p>{formatTasa(a.interestRate)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <main className="max-w-6xl mx-auto px-4 mt-10 mb-16">
      {/* Encabezado igual al de Cotizaciones */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Servicios aliados
        </h1>
        <p className="mt-3 text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
          Visualiza las constructoras, ferreterías y bancos que han sido
          aprobados como aliados de Construct IA. Esta información puede
          utilizarse para coordinar servicios y condiciones comerciales.
        </p>
      </div>

      {/* Contenedor blanco igual al de Cotizaciones */}
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm">
            Cargando servicios aliados...
          </p>
        ) : (
          <>
            <Section
              title="Constructoras aliadas"
              subtitle="Empresas constructoras aprobadas para brindar servicios a nuestros clientes."
              data={constructoras}
            />

            <Section
              title="Ferreterías aliadas"
              subtitle="Ferreterías y proveedores de materiales aprobados."
              data={ferreterias}
            />

            <Section
              title="Bancos aliados"
              subtitle="Bancos que ofrecen productos financieros relacionados con los proyectos de construcción."
              data={bancos}
            />
          </>
        )}
      </div>
    </main>
  );
}
