"use client";

import { useState } from "react";
import { db, storage, auth } from "@/firebase/config";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { v4 as uuidv4 } from "uuid";

export default function NuevaTarea() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [previewImagen, setPreviewImagen] = useState(null);

  const [user] = useAuthState(auth);

  // Función para probar la conexión con Firebase Storage
  const probarConexionStorage = async () => {
    try {
      console.log("Probando conexión con Firebase Storage...");
      const storageRef = ref(storage, 'imagenes/');
      await listAll(storageRef);
      console.log("✅ Conexión con Storage exitosa");
      return true;
    } catch (error) {
      console.error("❌ Error de conexión con Storage:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      // Verificar que el usuario esté autenticado
      if (!user) {
        alert("Debes estar autenticado para crear una tarea ❌");
        setCargando(false);
        return;
      }

      let urlImagen = "";

      // Si hay imagen, subirla a Firebase Storage
      if (imagen) {
        console.log("Subiendo imagen:", imagen.name);
        console.log("Usuario autenticado:", user.uid);
        
        // Probar conexión primero
        const conexionOk = await probarConexionStorage();
        if (!conexionOk) {
          const continuar = window.confirm(
            "Hay problemas de conexión con el almacenamiento. ¿Deseas guardar la tarea sin imagen?"
          );
          if (!continuar) {
            throw new Error("Conexión con Storage fallida");
          }
          urlImagen = "";
        } else {
          const nombreArchivo = `${uuidv4()}-${imagen.name}`;
          const ruta = ref(storage, `imagenes/${nombreArchivo}`);
          
          try {
            await uploadBytes(ruta, imagen);
            urlImagen = await getDownloadURL(ruta);
            console.log("Imagen subida exitosamente:", urlImagen);
          } catch (storageError) {
            console.error("Error específico de Storage:", storageError);
            console.error("Código de error:", storageError.code);
            console.error("Mensaje de error:", storageError.message);
            
            // Preguntar al usuario si quiere continuar sin imagen
            const continuar = window.confirm(
              "No se pudo subir la imagen. ¿Deseas guardar la tarea sin imagen?"
            );
            
            if (!continuar) {
              throw new Error("Upload cancelled by user");
            }
            
            // Continuar sin imagen
            urlImagen = "";
            console.log("Continuando sin imagen por error de upload");
          }
        }
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
      setPreviewImagen(null);
      alert("Tarea guardada con éxito ✅");
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Tipo de error:", error.constructor.name);
      
      let mensajeError = "Hubo un error al guardar la tarea ❌";
      
      if (error.code) {
        console.error("Código de error Firebase:", error.code);
        
        if (error.code === 'storage/unauthorized') {
          mensajeError = "No tienes permisos para subir imágenes. Verifica que estés autenticado ❌";
        } else if (error.code === 'storage/unknown') {
          mensajeError = "Error de conexión con el servidor. Verifica tu conexión a internet ❌";
        } else if (error.code === 'storage/quota-exceeded') {
          mensajeError = "Se ha excedido el límite de almacenamiento ❌";
        }
      }
      
      alert(mensajeError);
    }

    setCargando(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!tiposPermitidos.includes(file.type)) {
        alert("Tipo de archivo no permitido. Usa: JPG, PNG, GIF o WebP ❌");
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      const tamañoMaximo = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > tamañoMaximo) {
        alert("La imagen es muy grande. Máximo 5MB permitido ❌");
        return;
      }
      
      console.log("Archivo válido:", file.name, "Tamaño:", (file.size / 1024 / 1024).toFixed(2) + "MB");
    }
    
    setImagen(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImagen(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImagen(null);
    }
  };

  return (
    <div className="mt-28 w-full max-w-lg mx-auto">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Crear Nueva Tarea</h2>
          <p className="text-gray-600">Organiza tus ideas y proyectos</p>
        </div>

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
                id="imagen-input"
              />
              <label
                htmlFor="imagen-input"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 cursor-pointer group"
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

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={cargando}
          >
            {cargando ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </div>
            ) : (
              "Crear Tarea"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
