import Login from "@/components/Login";
import NuevaTarea from "@/components/NuevaTarea";
import ListaTareas from "@/components/ListaTareas";
import { auth } from "@/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Home() {
  const [user] = useAuthState(auth);
  //useState para comprobar si el usuario está autenticado
  // Si el usuario no está autenticado, se muestra el componente de Login

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
      {!user && <h1 className="text-3xl font-bold">App de Tarea</h1>}

      <Login />
      {user && (
        <>
          <NuevaTarea />
          <ListaTareas />
        </>
      )}
    </main>
  );
}
