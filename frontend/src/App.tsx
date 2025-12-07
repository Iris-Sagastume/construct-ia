import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import ArchitectChatWidget from "./components/ArchitectChatWidget";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-6">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white text-center py-3">
        © 2025 Construct IA. Todos los derechos reservados.
      </footer>

      {/* Asistente de diseño IA flotante en toda la web */}
      <ArchitectChatWidget />
    </div>
  );
}

export default App;

