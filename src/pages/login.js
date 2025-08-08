import { useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "@/firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function LoginPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  // Redireccionar al dashboard si ya está autenticado
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // La redirección se maneja en el useEffect
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar nada (se redirige)
  if (user) {
    return null;
  }

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
          Bienvenido a tu App de Tareas
        </h1>
        <p className="text-center mb-8 text-gray-700">
          Inicia sesión para empezar a organizar tu día
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