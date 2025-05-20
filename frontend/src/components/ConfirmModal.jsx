import { useEffect, useRef } from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

function ConfirmModal({ 
  show, 
  onClose, 
  onConfirm, 
  message, 
  title = "Confirmação", 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  loading = false,
  danger = true
}) {
  const modalRef = useRef(null);

  // Fechar modal ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      // Focar no modal quando aberto
      modalRef.current?.focus();
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay com animação */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
      ></div>

      {/* Container principal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal com animação e foco */}
        <div
          ref={modalRef}
          className={`bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg w-full ${
            show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          tabIndex="-1"
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <FaExclamationTriangle 
                className={`mr-2 ${
                  danger ? 'text-red-500' : 'text-blue-500'
                }`} 
              />
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Fechar"
            >
              <FaTimes />
            </button>
          </div>

          {/* Corpo */}
          <div className="p-6">
            <p className="text-gray-700">{message}</p>
          </div>

          {/* Rodapé */}
          <div className="flex flex-col sm:flex-row-reverse justify-end gap-3 p-4 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${
                danger 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-70 flex items-center justify-center min-w-24`}
            >
              {loading ? (
                <span className="animate-spin mr-2">↻</span>
              ) : null}
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;