import React from "react";

export default function About() {
  return (
    <main className="w-full">

      {/* ======================= HERO ======================= */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        <div className="relative grid md:grid-cols-2 overflow-hidden rounded-2xl shadow-xl bg-gradient-to-r from-slate-900 to-slate-800">
          
          {/* Texto */}
          <div className="p-8 md:p-10 text-white flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Construyendo Confianza y Calidad
            </h1>
            <p className="mt-3 text-slate-200">
              Somos expertos en construcción, remodelación y proyectos de ingeniería.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="#about"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Conocer más
              </a>
              <a
                href="/Contact"
                className="border border-white/70 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Contáctanos
              </a>
            </div>
          </div>

          {/* Imagen */}
          <div className="h-64 md:h-full">
            <img
              src="/images/about/hero.jpg"
              alt="Construcción profesional"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-900/70 to-transparent" />
        </div>
      </section>

      {/* ======================= QUIÉNES SOMOS ======================= */}
      <section id="about" className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Imagen */}
          <img
            src="/images/about/about.jpg"
            alt="Construcción profesional"
            className="w-full h-96 object-cover rounded-xl shadow-md"
          />

          {/* Texto */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Quiénes Somos
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Somos una empresa especializada en servicios de construcción, remodelación
              y gestión de proyectos. Combinamos experiencia, tecnología y mano de obra
              calificada para ofrecer soluciones duraderas y estéticamente superiores.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Nuestro enfoque está basado en calidad, eficiencia, comunicación clara
              y compromiso total con cada cliente.
            </p>
          </div>

        </div>
      </section>

      {/* ======================= EXPERIENCIA ======================= */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Texto */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Experiencia Comprobada
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Con múltiples proyectos completados en vivienda, obra civil,
              remodelación comercial y mantenimiento profesional.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Cada obra demuestra nuestra dedicación y profesionalismo.
            </p>
          </div>

          {/* Imagen */}
          <img
            src="/images/about/experience.jpg"
            alt="Equipo de construcción"
            className="w-full h-96 object-cover rounded-xl shadow-md"
          />

        </div>
      </section>

      {/* ======================= CTA ======================= */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          ¿Listo para iniciar tu próximo proyecto?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Estamos aquí para ayudarte a planificar, construir y transformar tus ideas.
        </p>

        <a
          href="/Contact"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Contáctanos
        </a>
      </section>
    </main>
  );
}
