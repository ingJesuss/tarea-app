import { useState } from "react";
import {
  Menu,
  X,
  Home,
  CheckSquare,
  PlusSquare,
  LogOut,
} from "lucide-react";

const Sidebar = ({ user, onSignOut, onNewTask }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Botón hamburguesa (solo en móvil) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 text-white p-2 rounded-md hover:bg-white/20 transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-sky-500 to-indigo-600 text-white flex flex-col z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static
        `}
      >
        {/* User Profile Section */}
        <div className="p-6 flex flex-col items-center border-b border-white/20">
          <img
            src={user?.photoURL || 'https://via.placeholder.com/150/FFFFFF/000000?text=User'}
            alt="Foto de perfil"
            className="w-20 h-20 rounded-full border-4 border-white/50 shadow-lg mb-3"
          />
          <h3 className="font-bold text-lg truncate w-full text-center">{user?.displayName}</h3>
          <p className="text-xs text-white/70 truncate w-full text-center">{user?.email}</p>
        </div>

        {/* Main Navigation */}
        <nav className="flex-grow p-4 space-y-2">
          <button
            onClick={() => {
              onNewTask();
              setIsOpen(false); // Cierra el sidebar en móvil
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-semibold"
          >
            <PlusSquare size={20} />
            Nueva Tarea
          </button>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
            <Home size={20} />
            Inicio
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/20 font-semibold transition-colors">
            <CheckSquare size={20} />
            Tareas
          </a>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/20">
          <button onClick={onSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/50 transition-colors">
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

