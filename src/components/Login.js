"use client";

import { auth } from "../firebase/config";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Login() {
  const [user] = useAuthState(auth);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  const logout = () => {
    signOut(auth);
  };

  if (!user) {
    return (
      <div
        className="relative h-screen w-full flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1470&q=80')",
        }}
      >
        {/* Overlay oscuro para mejorar contraste */}
        <div className="absolute inset-0 bg-black opacity-60"></div>

        {/* Contenedor del formulario */}
        <div className="relative z-10 w-full max-w-md bg-white bg-opacity-90 rounded-xl p-8 shadow-lg">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
            Bienvenido
          </h1>
          <p className="text-center mb-8 text-gray-700">
            Inicia sesión para continuar
          </p>
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-6 h-6"
            />
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
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
