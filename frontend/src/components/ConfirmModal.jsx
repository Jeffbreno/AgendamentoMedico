function ConfirmModal({ show, onClose, onConfirm, message }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 shadow-lg w-80">
        <h3 className="text-lg font-bold mb-4">Confirmação</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
