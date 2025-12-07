export default function Contact() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center py-20">

      {/* Título */}
      <h1 className="text-4xl font-bold text-[#1A2B6D] text-center mb-6">
        ¿Necesita más información?
      </h1>

      <p className="text-gray-600 text-center max-w-2xl mb-16">
        Nuestro equipo está listo para atenderle en cualquiera de nuestras oficinas.  
        Estamos aquí para brindarle asistencia personalizada.
      </p>

      {/* Contenido */}
      <div className="flex w-[90%] max-w-6xl justify-between items-center gap-10">

        {/* Card de Contacto */}
        <div className="w-[50%] bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Información de Contacto
          </h2>

          <p className="text-gray-600 mb-6">
            Puede remitir sus consultas o comentarios a los siguientes medios:
          </p>

          {/* Email */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-blue-600 text-lg">📧</span>
            <a href="mailto:info@constructia.com" className="text-blue-600 font-medium">
              info@constructia.com
            </a>
          </div>

          {/* Teléfonos */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-pink-600 text-lg">📞</span>
            <span className="text-gray-700">+504 9876-1234</span>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <span className="text-pink-600 text-lg">📞</span>
            <span className="text-gray-700">+504 9988-4521</span>
          </div>

          {/* Oficinas */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Nuestras Oficinas
          </h3>

          <div className="mb-4">
            <p className="font-medium text-gray-800">Tegucigalpa</p>
            <p className="text-gray-600 text-sm">
              Oficina Central Construct IA<br />
              Colonia Mirador del Este, Calle Principal #245<br />
              Frente al Parque Industrial Aurora<br />
              Tegucigalpa, M.D.C., Honduras, C.A.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-800">San Pedro Sula</p>
            <p className="text-gray-600 text-sm">
              Oficina Regional Construct IA — San Pedro Sula<br />
              Colonia Trejo, 11 Calle, 15 Avenida S.O.<br />
              Frente al Centro Comercial Ángeles<br />
              San Pedro Sula, Cortés, Honduras, C.A.
            </p>
          </div>
        </div>

        {/* Imagen corporativa */}
        <div className="relative w-[45%] h-[340px] rounded-2xl overflow-hidden shadow-xl">
          <img
            src="/images/contact-hero.jpg"
            alt="Construct IA Contacto"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/20"></div>
        </div>

      </div>

      {/* Footer pequeño frase */}
      <div className="mt-12 bg-blue-100 text-blue-800 px-10 py-3 rounded-xl text-sm">
        Construct IA — Construyendo el futuro contigo
      </div>

    </div>
  );
}



