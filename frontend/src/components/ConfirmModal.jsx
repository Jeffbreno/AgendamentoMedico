import { useEffect, useRef } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

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
      modalRef.current?.focus();
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop com animação */}
      <div 
        className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ${
          show ? 'ease-out duration-300 opacity-100' : 'ease-in duration-200 opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Container principal - Alterações principais aqui */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Painel do modal com animações */}
        <div
          ref={modalRef}
          className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-lg ${
            show 
              ? 'ease-out duration-300 opacity-100 translate-y-0 scale-100' 
              : 'ease-in duration-200 opacity-0 translate-y-4 scale-95'
          }`}
          tabIndex="-1"
        >
          {/* Conteúdo */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                danger ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <FaExclamationTriangle 
                  className={`h-6 w-6 ${
                    danger ? 'text-red-600' : 'text-blue-600'
                  }`} 
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                danger
                  ? 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600'
                  : 'bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600'
              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70`}
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
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-70"
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