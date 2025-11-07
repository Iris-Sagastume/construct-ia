// src/pages/Home.tsx
export default function Projects() {
 const projects = ["Proyecto A", "Proyecto B", "Proyecto C"];

  return (
    <section className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p, i) => (
        <div key={i} className="bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition">
          <h2 className="text-lg font-bold text-gray-700">{p}</h2>
          <p className="text-sm text-gray-500 mt-2">Descripción breve del proyecto.</p>
        </div>
      ))}
    </section>
  );
}
