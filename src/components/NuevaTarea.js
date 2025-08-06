"use client";

import { useState } from "react";
import { db, storage, auth } from "@/firebase/config";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { v4 as uuidv4 } from "uuid";

export default function NuevaTarea() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [user] = useAuthState(auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      let urlImagen = "";

      // Si hay imagen, subirla a Firebase Storage
      if (imagen) {
        const nombreArchivo = `${uuidv4()}-${imagen.name}`;
        const ruta = ref(storage, `imagenes/${nombreArchivo}`);
        await uploadBytes(ruta, imagen);
        urlImagen = await getDownloadURL(ruta);
      }

      // Guardar tarea en Firestore
      await addDoc(collection(db, "tareas"), {
        titulo,
        descripcion,
        imagen: urlImagen || null,
        autor: {
          uid: user.uid,
          nombre: user.displayName,
          foto: user.photoURL,
        },
        fecha: Timestamp.now(),
      });

      // Limpiar formulario
      setTitulo("");
      setDescripcion("");
      setImagen(null);
      alert("Tarea guardada con éxito ✅");
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      alert("Hubo un error al guardar la tarea ❌");
    }

    setCargando(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow-md w-full max-w-md flex flex-col gap-4"
    >
      <h2 className="text-xl font-bold text-center">Crear Nueva Tarea</h2>

      <input
        type="text"
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <textarea
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="border p-2 rounded"
        rows={4}
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImagen(e.target.files[0])}
        className="border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        disabled={cargando}
      >
        {cargando ? "Guardando..." : "Guardar tarea"}
      </button>
    </form>
  );
}
