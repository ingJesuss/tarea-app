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
  const [vistaActual, setVistaActual] = useState("tarjetas"); // "tarjetas" o "tabla"
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

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";
    const fecha = timestamp.toDate();
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const TarjetaVista = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tareas.map((tarea) => (
        <div
          key={tarea.id}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-[1.02]"
        >
          {tarea.imagen && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={tarea.imagen}
                alt="Imagen de la tarea"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-800 line-clamp-2">
                {tarea.titulo}
              </h3>
              {user?.uid === tarea.autor?.uid && (
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => eliminarTarea(tarea)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <a
                    href={`/editar/${tarea.id}`}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-3">{tarea.descripcion}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                {tarea.autor?.foto && (
                  <img
                    src={tarea.autor.foto}
                    alt={tarea.autor.nombre}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span>{tarea.autor?.nombre}</span>
              </div>
              <span>{formatearFecha(tarea.fecha)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TablaVista = () => (
    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tarea</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Descripción</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Autor</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tareas.map((tarea) => (
              <tr key={tarea.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {tarea.imagen && (
                      <img
                        src={tarea.imagen}
                        alt="Imagen de la tarea"
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">{tarea.titulo}</h3>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-600 max-w-xs truncate">{tarea.descripcion}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {tarea.autor?.foto && (
                      <img
                        src={tarea.autor.foto}
                        alt={tarea.autor.nombre}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-gray-700">{tarea.autor?.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {formatearFecha(tarea.fecha)}
                </td>
                <td className="px-6 py-4">
                  {user?.uid === tarea.autor?.uid && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => eliminarTarea(tarea)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <a
                        href={`/editar/${tarea.id}`}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 px-4">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Mis Tareas</h2>
          <p className="text-gray-600">
            {tareas.length === 0 ? "No hay tareas registradas aún" : `${tareas.length} tarea${tareas.length !== 1 ? 's' : ''} encontrada${tareas.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Selector de vista */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setVistaActual("tarjetas")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                vistaActual === "tarjetas"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
              </svg>
              Tarjetas
            </button>
            <button
              onClick={() => setVistaActual("tabla")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                vistaActual === "tabla"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9" />
              </svg>
              Tabla
            </button>
          </div>

          {/* Botón eliminar todas */}
          {tareas.length > 0 && user && <EliminarTodas />}
        </div>
      </div>

      {/* Contenido */}
      {tareas.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay tareas aún</h3>
          <p className="text-gray-600">Crea tu primera tarea para comenzar a organizar tus proyectos</p>
        </div>
      ) : (
        <div className="animate-fade-in">
          {vistaActual === "tarjetas" ? <TarjetaVista /> : <TablaVista />}
        </div>
      )}
    </div>
  );
}
