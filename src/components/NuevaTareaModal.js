"use client";

import { useState } from "react";
import { db, storage, auth } from "@/firebase/config";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { v4 as uuidv4 } from "uuid";

export default function NuevaTareaModal({ isOpen, onClose }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [previewImagen, setPreviewImagen] = useState(null);

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

      // Limpiar formulario y cerrar modal
      setTitulo("");
      setDescripcion("");
      setImagen(null);
      setPreviewImagen(null);
      onClose();
      alert("Tarea guardada con éxito ✅");
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      alert("Hubo un error al guardar la tarea ❌");
    }

    setCargando(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImagen(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImagen(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImagen(null);
    }
  };

  const handleClose = () => {
    if (!cargando) {
      // Limpiar formulario al cerrar
      setTitulo("");
      setDescripcion("");
      setImagen(null);
      setPreviewImagen(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Nueva Tarea</h2>
              <p className="text-sm text-gray-600">Organiza tus ideas y proyectos</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={cargando}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Imagen (opcional)</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imagen-input-modal"
                  disabled={cargando}
                />
                <label
                  htmlFor="imagen-input-modal"
                  className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 cursor-pointer group ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 group-hover:text-green-600">
                      {imagen ? imagen.name : "Seleccionar imagen"}
                    </p>
                  </div>
                </label>
              </div>
              
              {previewImagen && (
                <div className="mt-4">
                  <img
                    src={previewImagen}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Botones del modal */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={cargando}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                disabled={cargando}
              >
                {cargando ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </div>
                ) : (
                  "Crear Tarea"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}