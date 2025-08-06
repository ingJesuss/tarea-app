"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { db, storage } from "@/firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp
} from "firebase/firestore";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export default function EditarTarea() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenURL, setImagenURL] = useState(null);
  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarTarea = async () => {
      const refTarea = doc(db, "tareas", id);
      const docSnap = await getDoc(refTarea);
      if (docSnap.exists()) {
        const datos = docSnap.data();
        setTitulo(datos.titulo);
        setDescripcion(datos.descripcion);
        setImagenURL(datos.imagen || null);
      } else {
        alert("Tarea no encontrada");
        router.push("/");
      }
    };

    cargarTarea();
  }, [id, router]);

  const handleEliminarImagen = async () => {
    if (!imagenURL) return;

    const confirmacion = confirm("¿Seguro que deseas eliminar la imagen?");
    if (!confirmacion) return;

    try {
      const refImg = ref(storage, imagenURL);
      await deleteObject(refImg);
      setImagenURL(null);
      alert("Imagen eliminada");
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      alert("No se pudo eliminar la imagen");
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const confirmacion = confirm("¿Guardar cambios en la tarea?");
    if (!confirmacion) return;

    setCargando(true);

    try {
      let nuevaURL = imagenURL;

      if (nuevaImagen) {
        const nombre = `${uuidv4()}-${nuevaImagen.name}`;
        const ruta = ref(storage, `imagenes/${nombre}`);
        await uploadBytes(ruta, nuevaImagen);
        nuevaURL = await getDownloadURL(ruta);
      }

      const refTarea = doc(db, "tareas", id);
      await updateDoc(refTarea, {
        titulo,
        descripcion,
        imagen: nuevaURL || null,
        fecha: Timestamp.now()
      });

      alert("Tarea actualizada ✅");
      router.push("/");
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
      alert("No se pudo actualizar ❌");
    }

    setCargando(false);
  };

  return (
    <form
      onSubmit={handleGuardar}
      className="bg-white p-6 rounded shadow-md max-w-xl mx-auto mt-10 flex flex-col gap-4"
    >
      <h2 className="text-xl text-black font-bold uppercase">Editar Tarea</h2>

      <input
        type="text"
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="text-gray-500 uppercase border p-2 rounded"
        required
      />

      <textarea
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="text-gray-500 border p-2 rounded"
        rows={4}
        required
      />

      {imagenURL && (
        <div className="relative">
          <img src={imagenURL} alt="Imagen actual" className="rounded w-full max-h-64 object-cover" />
          <button
            type="button"
            onClick={handleEliminarImagen}
            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs"
          >
            Eliminar imagen
          </button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setNuevaImagen(e.target.files[0])}
        className="border p-2 rounded"
      />

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={cargando}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {cargando ? "Guardando..." : "Guardar cambios"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
