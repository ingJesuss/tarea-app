"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db, storage } from "@/firebase/config";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

export default function EditarTarea() {
  const router = useRouter();
  const { id } = router.query;
  const { toast, showToast, hideToast } = useToast();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenURL, setImagenURL] = useState(null);
  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!id) return; // Wait for router to be ready

    const cargarTarea = async () => {
      const refTarea = doc(db, "tareas", id);
      const docSnap = await getDoc(refTarea);
      if (docSnap.exists()) {
        const datos = docSnap.data();
        setTitulo(datos.titulo);
        setDescripcion(datos.descripcion);
        setImagenURL(datos.imagen || null);
      } else {
        showToast("Tarea no encontrada", "error");
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
      showToast("Imagen eliminada correctamente", "success");
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      showToast("No se pudo eliminar la imagen", "error");
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
        fecha: Timestamp.now(),
      });

      showToast("Tarea actualizada correctamente", "success");
      setTimeout(() => router.push("/"), 1000);
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
      showToast("No se pudo actualizar la tarea", "error");
    }

    setCargando(false);
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tarea...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header con navegación */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Editar Tarea</h1>
              <p className="text-sm text-gray-600">Actualiza los detalles de tu tarea</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Header del formulario */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Editar Tarea</h2>
                <p className="text-green-100">Actualiza la información de tu tarea</p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleGuardar} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                placeholder="Ingresa el título de tu tarea"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                required
                disabled={cargando}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                placeholder="Describe los detalles de tu tarea"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none"
                rows={4}
                required
                disabled={cargando}
              />
            </div>

            {/* Imagen actual */}
            {imagenURL && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Imagen actual</label>
                <div className="relative group">
                  <img
                    src={imagenURL}
                    alt="Imagen actual"
                    className="w-full h-64 object-cover rounded-xl border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleEliminarImagen}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar imagen
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Nueva imagen */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {imagenURL ? "Cambiar imagen" : "Agregar imagen (opcional)"}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNuevaImagen(e.target.files[0])}
                  className="hidden"
                  id="nueva-imagen-input"
                  disabled={cargando}
                />
                <label
                  htmlFor="nueva-imagen-input"
                  className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 cursor-pointer group ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 group-hover:text-green-600">
                      {nuevaImagen ? nuevaImagen.name : "Seleccionar nueva imagen"}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={cargando}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {cargando ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando cambios...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar cambios
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                disabled={cargando}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
