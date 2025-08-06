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

  // Vista para usuario autenticado
return (
  <div className="w-full flex justify-end px-4 mt-4">
    <div className="bg-white shadow-md border px-5 py-3 flex items-center gap-4 rounded-xl z-10 animate-fade-in max-w-md">
      <img
        src={user.photoURL}
        alt="Foto de perfil"
        className="w-14 h-14 rounded-full border-2 border-indigo-500 shadow-sm"
      />
      <div>
        <p className="text-base font-semibold text-gray-800">
          Hola, {user.displayName}
        </p>
        <p className="text-sm text-gray-500">Bienvenido de nuevo</p>
      </div>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 transition duration-300 text-sm font-medium shadow"
      >
        Cerrar sesión
      </button>
    </div>
  </div>
);

}
