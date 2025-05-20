import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Cabeçalho */}
        <header className="bg-blue-600 text-white px-6 py-4 shadow">
          <h1 className="text-xl font-semibold">Sistema de Agendamento Médico</h1>
        </header>

        {/* Conteúdo */}
        <main className="p-6 flex-1">{children}</main>

        {/* Rodapé */}
        <footer className="bg-gray-200 text-center text-sm text-gray-600 py-3">
          © 2025 - Clínica Médica
        </footer>
      </div>
    </div>
  );
}

export default Layout;
