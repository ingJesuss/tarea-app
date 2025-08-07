import { useState } from "react";
import Login from "@/components/Login";
import NuevaTareaModal from "@/components/NuevaTareaModal";
import ListaTareas from "@/components/ListaTareas";
import { auth } from "@/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Home() {
  const [user] = useAuthState(auth);
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {!user && (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <h1 className="text-3xl font-bold">App de Tarea</h1>
          <Login />
        </div>
      )}

      {user && (
        <>
          <Login />
          <div className="p-8">
            {/* Header con botón de nueva tarea */}
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

                <button
                  onClick={() => setModalAbierto(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Nueva Tarea
                </button>
              </div>
            </div>

            {/* Lista de tareas */}
            <ListaTareas />

            {/* Modal de nueva tarea */}
            <NuevaTareaModal
              isOpen={modalAbierto}
              onClose={() => setModalAbierto(false)}
            />

            {/* Botón flotante para móviles */}
            <button
              onClick={() => setModalAbierto(true)}
              className="fixed bottom-6 right-6 sm:hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl focus:ring-4 focus:ring-green-200 transition-all duration-200 transform hover:scale-110 active:scale-95 z-40"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </main>
  );
}
