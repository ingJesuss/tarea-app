import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Login from "@/components/Login";
import NuevaTareaModal from "@/components/NuevaTareaModal";
import ListaTareas from "@/components/ListaTareas";
import Sidebar from "@/components/Sidebar";
import { auth } from "@/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";


export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [modalAbierto, setModalAbierto] = useState(false);
  const router = useRouter();

  // Redireccionar al login si no hay usuario autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // nos manda al login
    }
  }, [user, loading, router]);

  // Función para cerrar sesión que se pasará al Sidebar
  const handleSignOut = () => signOut(auth);

  // Función unificada para abrir el modal de nueva tarea
  const handleNewTask = () => setModalAbierto(true);

  // Mostrar loading mientras verifica autenticación (sp)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (se redirige)
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Componente Login solo para mostrar info del usuario */}
      <Login />
      
      {/* Dashboard - solo visible cuando hay usuario autenticado */}
      <div className="flex">
        <Sidebar user={user} onSignOut={handleSignOut} onNewTask={handleNewTask} />

        {/* Contenedor para el contenido principal */}
        <div className="flex-1 p-8 md:ml-64"> {/* Añadimos margen a la izquierda en desktop para no solapar con el sidebar */}
          <div className="w-full">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    ¡Hola, {user.displayName?.split(" ")[0] || "Usuario"}! 👋
                  </h1>
                  <p className="text-gray-600">
                    Organiza tus tareas y mantente productivo
                  </p>
                </div>

               
              </div>
            </div>

            {/* Lista de tareas */}
            <ListaTareas />
          </div>
        </div>

        {/* Modal y botón flotante (se mantienen fuera para superponerse) */}
        <NuevaTareaModal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
        />
        
        <button
          onClick={handleNewTask}
          className="fixed bottom-6 right-6 sm:hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl focus:ring-4 focus:ring-green-200 transition-all duration-200 transform hover:scale-110 active:scale-95 z-40"
          aria-label="Añadir nueva tarea"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </main>
  );
}
