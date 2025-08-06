import { useState } from "react";


const EditTaskModal = ({ isOpen, onClose, task, onSave }) => {
  const [newTitle, setNewTitle] = useState(task?.title || "");
  const [newFile, setNewFile] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ ...task, title: newTitle, file: newFile });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Editar tarea</h2>
        <input
          type="text"
          className="w-full p-2 mb-4 border rounded"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input
          type="file"
          className="w-full mb-4"
          onChange={(e) => setNewFile(e.target.files[0])}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">Cancelar</button>
          <button onClick={handleSave} className="px-3 py-1 bg-blue-500 text-white rounded">Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
