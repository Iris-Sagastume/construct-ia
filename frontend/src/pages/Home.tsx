export default function Home() {
  const projects = [
    {
      name: "Residencial Las Lomas",
      value: "L. 2,800,000",
      location: "6 cuadras al norte del parque central",
      includes:
        "3 habitaciones, 2 baños, cocina equipada, garaje y jardín frontal.",
      image: "/images/projects/las-lomas.jpg",
    },
    {
      name: "Villa Moderna",
      value: "L. 3,600,000",
      location: "4 cuadras al sur del boulevard principal",
      includes:
        "2 plantas, terraza panorámica, piscina y acabados de lujo.",
      image: "/images/projects/villa-moderna.jpg",
    },
    {
      name: "Casa Los Olivos",
      value: "L. 2,150,000",
      location: "8 cuadras al este del centro comercial MegaMall",
      includes:
        "2 habitaciones, sala amplia, patio trasero y sistema de energía solar.",
      image: "/images/projects/los-olivos.jpg",
    },
  ];


    return (
      <main className="w-full">
        {/* HERO tipo banner, no ocupa toda la pantalla */}
        <section className="max-w-6xl mx-auto px-4 mt-8">
          <div className="relative grid md:grid-cols-2 overflow-hidden rounded-2xl shadow-xl bg-gradient-to-r from-slate-900 to-slate-800">
            {/* Texto (izquierda) */}
            <div className="p-8 md:p-10 text-white flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-extrabold">
                Bienvenido a Construct IA
              </h1>
              <p className="mt-3 text-slate-200">
                Cotiza, gestiona y construye tus proyectos con tecnología.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  href="#projects"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Ver proyectos
                </a>
               <button
                type="button"
                onClick={() => (window as any).openArchitectChat?.()}
                className="border border-white/70 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition"
                >
                Solicitar cotización
                </button>
              </div>
            </div>

            {/* Imagen (derecha) */}
            <div className="h-64 md:h-full">
              <img
                src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=80"
                alt="Casa moderna"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Curva/overlay sutil para mezcla agradable */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-900/70 to-transparent" />
          </div>
        </section>

        {/* Sección de proyectos (debajo, con espacio) */}
        <section id="projects" className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Proyectos destacados
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p, i) => (
              <article
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition transform hover:-translate-y-1"
              >
                <img src={p.image} alt={p.name} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800">{p.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{p.location}</p>
                  <p className="text-blue-600 font-bold text-lg mt-3">{p.value}</p>
                  <p className="text-sm text-gray-600 mt-3">{p.includes}</p>
                  <div className="mt-4 flex gap-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                      Ver detalles
                    </button>
                    <button
                    type="button"
                    onClick={() => (window as any).openArchitectChat?.()}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                    Cotizar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  }

