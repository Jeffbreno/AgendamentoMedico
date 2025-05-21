import { useState } from 'react';
import Sidebar from './Sidebar';
import { FaBell, FaUserCircle, FaCog } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';

function Layout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex">
      {/* Sidebar para desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Overlay para mobile */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar para mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden transition-transform duration-300 ease-in-out`}>
        <Sidebar />
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cabeçalho */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Botão para mobile */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <FiMenu className="h-6 w-6" />
            </button>

            <div className="flex-1 ml-4">
              <h1 className="text-xl font-semibold text-gray-700">Sistema de Agendamento Médico</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 relative">
                <FaBell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              <button className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100">
                <FaCog className="h-5 w-5" />
              </button>

              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <FaUserCircle className="h-5 w-5" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:inline">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>

        {/* Rodapé */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Clínica Médica - Todos os direitos reservados
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Termos</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacidade</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Contato</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Layout;