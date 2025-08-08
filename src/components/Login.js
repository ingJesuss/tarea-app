"use client";

import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Login() {
  const [user] = useAuthState(auth);

  const logout = () => {
    signOut(auth);
  };

  // Solo mostrar si hay usuario autenticado
  if (!user) {
    return null;
  }

  // Vista para usuario autenticado - mostrar en header
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-3 rounded-xl animate-fade-in">
        <img
          src={user.photoURL}
          alt="Foto de perfil"
          className="w-10 h-10 rounded-full border-2 border-green-500 shadow-sm"
        />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-800">
            {user.displayName}
          </p>
          <p className="text-xs text-gray-500">En línea</p>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition duration-300 text-xs font-medium shadow-sm"
          title="Cerrar sesión"
        >
          <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </div>
  );

}
