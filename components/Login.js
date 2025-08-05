"use client";

import { auth } from "../firebase/config";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Login() {
  // Hook para saber si el usuario está autenticado
  const [user] = useAuthState(auth);

  // Iniciar sesión con Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  // Cerrar sesión
  const logout = () => {
    signOut(auth);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {!user ? (
        <button
          onClick={loginWithGoogle}
          className="bg-blue-500 text-whit px-4 py-2 rounded hover:bg-blue-600"
        >
          Iniciar sesión con Google
        </button>
      ) : (
        <div className="flex flex-col items-center">
          <img src={user.photoURL} alt="Foto de perfil" className="w-16 h-16 rounded-full" />
          <p className="mt-2">Hola, {user.displayName}</p>
          <button
            onClick={logout}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
