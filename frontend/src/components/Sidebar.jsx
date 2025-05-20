import { Link, useLocation } from 'react-router-dom';
import { FaUserMd, FaHospital, FaStethoscope, FaUsers } from 'react-icons/fa';

const navItems = [
  { label: 'Especialidades', to: '/admin/especialidades', icon: <FaStethoscope /> },
  { label: 'Convênios', to: '/admin/convenios', icon: <FaHospital /> },
  { label: 'Médicos', to: '/admin/medicos', icon: <FaUserMd /> },
  { label: 'Pacientes', to: '/admin/pacientes', icon: <FaUsers /> },
];

function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-60 bg-white border-r min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin</h2>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 ${
              pathname === item.to ? 'bg-blue-600 text-white' : 'text-gray-800'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
