// Importa las funciones de Firebase que usaremos
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase (la que copiaste)
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyAP1V_ACbYota-5pmsyU_jqOqcS5-dQgCU",
  authDomain: "prueba-jesus-62ac6.firebaseapp.com",
  projectId: "prueba-jesus-62ac6",
  storageBucket: "prueba-jesus-62ac6.firebasestorage.app",
  messagingSenderId: "134724954252",
  appId: "1:134724954252:web:006411bf960cc7fe3173a9"
};

// Inicializa Firebase solo una vez
const app = initializeApp(firebaseConfig);

// Exporta los servicios que vas a usar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
