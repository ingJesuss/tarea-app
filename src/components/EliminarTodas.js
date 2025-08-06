"use client";

import { useState } from "react";
import { db, storage, auth } from "@/firebase/config";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";

export default function EliminarTodas() {
  const [user] = useAuthState(auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const PIN_CORRECTO = "1234";      // Borra solo usuario
  const MASTER_PASSWORD = "M123";  // Borra TODO

  const handleEliminarTodas = async () => {
    setError("");

    if (pin !== PIN_CORRECTO && pin !== MASTER_PASSWORD) {
      setError("PIN incorrecto. Intenta de nuevo.");
      return;
    }

    setLoading(true);

    try {
      const tareasRef = collection(db, "tareas");
      const snapshot = await getDocs(tareasRef);

      // Si PIN es MASTER_PASSWORD: borrar todas las tareas (sin filtro)
      // Si PIN es PIN_CORRECTO: borrar solo tareas del usuario
      const tareasAEliminar = pin === MASTER_PASSWORD
        ? snapshot.docs
        : snapshot.docs.filter((doc) => doc.data().autor?.uid === user.uid);

      for (const tarea of tareasAEliminar) {
        const data = tarea.data();

        if (data.imagen) {
          const ruta = ref(storage, data.imagen);
          await deleteObject(ruta).catch(() => {});
        }

        await deleteDoc(doc(db, "tareas", tarea.id));
      }

      alert(pin === MASTER_PASSWORD ? "¡Todas las tareas han sido eliminadas!" : "Tus tareas han sido eliminadas.");
      setModalOpen(false);
      setPin("");
    } catch (error) {
      console.error("Error eliminando tareas:", error);
      setError("No se pudieron eliminar las tareas.");
    }

    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all duration-300"
      >
        Eliminar todas mis tareas
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <h3 className="text-xl font-bold text-black mb-4 text-center">Confirmar eliminación</h3>
            <p className="mb-2 text-center text-black">Ingresa tu PIN para confirmar el borrado de las tareas</p>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="text-gray-600 w-full border p-2 rounded mb-4"
              disabled={loading}
            />
            {error && (
              <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>
            )}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setPin("");
                  setError("");
                }}
                className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarTodas}
                className={`px-4 py-2 rounded text-white ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={loading}
              >
                {loading ? "Eliminando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
