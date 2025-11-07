import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">Construct IA</h1>
      <div className="flex gap-6">
        <Link to="/" className="hover:text-blue-500">Inicio</Link>
        <Link to="/projects" className="hover:text-blue-500">Proyectos</Link>
        <Link to="/about" className="hover:text-blue-500">Nosotros</Link>
        <Link to="/contact" className="hover:text-blue-500">Contacto</Link>
      </div>
    </nav>
  );
}
