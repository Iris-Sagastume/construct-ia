import "../App.css";

export default function Projects() {
  return (
    <main className="w-full">

      {/* HERO SECTION */}
      <section className="py-10">
        <div className="w-[90%] max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          {/* Texto */}
          <div>
            <h1 className="text-3xl font-bold mb-4">Nuestros Proyectos</h1>

            <p className="text-lg text-gray-700 mb-6">
              Descubre las obras desarrolladas con ingeniería moderna, eficiencia y
              tecnología avanzada. Garantizamos calidad en cada etapa del proceso.
            </p>

            <div className="flex gap-4">
              <a href="#listado" className="btn-primary">
                Ver listado completo
              </a>

              <a href="/cotizacion" className="btn-secondary">
                Solicitar cotización
              </a>
            </div>
          </div>

          {/* Imagen hero */}
          <div className="w-full">
            <img
              src="/images/projects/proyecto.jpg"
              className="rounded-xl shadow-lg object-cover w-full h-[350px]"
              alt="Construcción moderna"
            />
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="py-14">
        <div className="w-[90%] max-w-6xl mx-auto flex flex-wrap gap-4 items-center">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">
            Todos
          </button>

          <button className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
            Residenciales
          </button>

          <button className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
            Comerciales
          </button>

          <button className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
            Urbanizaciones
          </button>
        </div>
      </section>

      {/* LISTADO DE PROYECTOS */}
      <section id="listado" className="pb-28">
        <div className="w-[90%] max-w-6xl mx-auto">

          <h2 className="text-2xl font-bold mb-8">Proyectos realizados</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

            {/* Card 1 */}
            <div className="card">
              <img
                src="/images/projects/las-lomas.jpg"
                alt="Residencial Las Lomas"
                className="w-full h-[260px] object-cover rounded-xl"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Residencial Las Lomas</h3>

                <p className="text-gray-600 text-sm mb-4">
                  Viviendas familiares con diseño contemporáneo y excelentes acabados.
                </p>

                <p className="font-bold text-blue-600">L. 2,800,000</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="card">
              <img
                src="/images/projects/villa-moderna.jpg"
                alt="Villa Moderna"
                className="w-full h-[260px] object-cover rounded-xl"
              />

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Villa Moderna</h3>

                <p className="text-gray-600 text-sm mb-4">
                  Diseño minimalista con amplios espacios abiertos y acabados premium.
                </p>

                <p className="font-bold text-blue-600">L. 3,600,000</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card">
              <img
                src="/images/projects/los-olivos.jpg"
                alt="Residencial Los Olivos"
                className="w-full h-[260px] object-cover rounded-xl"
              />

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Residencial Los Olivos</h3>

                <p className="text-gray-600 text-sm mb-4">
                  Comunidad privada con áreas verdes, acceso controlado y hogares modernos.
                </p>

                <p className="font-bold text-blue-600">L. 1,950,000</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
