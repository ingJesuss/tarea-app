// pages/api/tasks.js
import { db } from '../../firebase/config'; // Asegúrate de que el archivo firebase.js está bien configurado
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  try {
    const tasksRef = collection(db, 'tareas');
    const snapshot = await getDocs(tasksRef);
     console.log('Cantidad de documentos:', snapshot.size);

    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener las tareas:', error.message, error.code);
    res.status(500).json({ error: 'Error al obtener las tareas', details: error.message });
  }
}
