"use client";

import { useEffect, useState } from "react";
import { db, storage, auth } from "@/firebase/config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import EliminarTodas from "./EliminarTodas";

export default function ListaTareas() {
  const [tareas, setTareas] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const q = query(collection(db, "tareas"), orderBy("fecha", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tareasBD = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTareas(tareasBD);
    });

    return () => unsubscribe();
  }, []);

  const eliminarTarea = async (tarea) => {
    const confirmacion = confirm("¿Seguro que deseas eliminar esta tarea?");
    if (!confirmacion) return;

    try {
      // 1. Eliminar imagen si existe
      if (tarea.imagen) {
        const ruta = ref(storage, tarea.imagen);
        await deleteObject(ruta).catch(() => {
          // En caso de error, ignoramos (la imagen podría haber sido eliminada antes)
        });
      }

      // 2. Eliminar documento de Firestore
      await deleteDoc(doc(db, "tareas", tarea.id));
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      alert("No se pudo eliminar la tarea ❌");
    }
  };

  return (
    <div className="w-full max-w-2xl mt-8 space-y-4">
      <h2 className="text-2xl font-bold text-green-600">Mis Tareas</h2>
      {/* Aquí mostramos el botón para eliminar todas las tareas, 
        solo si hay tareas y el usuario está autenticado */}
      {tareas.length > 0 && user && (
        <div className="mb-4">
          <EliminarTodas />
        </div>
      )}
      {tareas.length === 0 && (
        <p className="text-gray-500 text-red-600">
          No hay tareas registradas aún.
        </p>
      )}

      {tareas.map((tarea) => (
        <div key={tarea.id} className="border p-4 rounded shadow relative">
          <h3 className="text-xl text-green-600 font-bolder uppercase">
            {tarea.titulo}
          </h3>
          <p className="text-700">{tarea.descripcion}</p>

          {tarea.imagen && (
            <img
              src={tarea.imagen}
              alt="Imagen de la tarea"
              className="w-full max-h-60 object-cover mt-4 rounded"
            />
          )}

          <p className="text-sm text-gray-400 mt-2">
            Publicado por: {tarea.autor?.nombre}
          </p>

          {user?.uid === tarea.autor?.uid && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => eliminarTarea(tarea)}
                className="text-red-600 hover:underline text-sm"
              >
                Eliminar
              </button>

              <a
                href={`/editar/${tarea.id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Editar
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
