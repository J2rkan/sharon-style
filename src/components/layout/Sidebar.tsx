import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calculator, Settings, ReceiptText, ArrowLeftRight, PiggyBank } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { AdminLoginModal } from '../auth/AdminLoginModal';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const adminNavItems = [
  { name: 'Dashboard General', href: '/', icon: LayoutDashboard },
  { name: 'Cuentas por Cobrar', href: '/tickets', icon: ReceiptText },
  { name: 'Nómina', href: '/payroll', icon: PiggyBank },
  { name: 'Personal', href: '/staff', icon: Users },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

const employeeNavItems = [
  { name: 'Mis Cuentas', href: '/tickets', icon: ReceiptText },
  { name: 'Nuevo Servicio', href: '/service', icon: Calculator },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { appRole, setAppRole, setAdminAuthenticated } = useStore();
  const navItems = appRole === 'admin' ? adminNavItems : employeeNavItems;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRoleSwitch = () => {
    if (appRole === 'admin') {
      // Switching back to employee: Revoke admin access and switch immediately
      setAdminAuthenticated(false);
      setAppRole('employee');
      navigate('/service');
    } else {
      // Trying to switch to admin: Open the password modal
      setIsModalOpen(true);
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-dark-card border-r border-[#333] shadow-2xl flex flex-col z-50">
      <div className="flex h-20 items-center px-6 border-b border-[#333]">
        <h1 className="text-2xl font-bold tracking-wider">
          <span className="text-white">SHARON</span>
          <span className="text-primary ml-2">STYLE</span>
        </h1>
      </div>
      
      <div className="p-4 border-b border-[#333]">
        <button 
          onClick={handleRoleSwitch}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] rounded-xl transition-colors focus:ring-1 focus:ring-primary outline-none group"
        >
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Vista Actual</span>
            <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
              {appRole === 'admin' ? 'Caja / Admin' : 'Modo Empleado'}
            </span>
          </div>
          <ArrowLeftRight className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-600 mb-4 px-2 tracking-wider">MENÚ PRINCIPAL</div>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out group',
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#333]">
        <div className="flex items-center gap-3 pb-2 pt-1 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-dark p-[2px]">
            <div className="w-full h-full rounded-full bg-dark-card border border-dark flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{appRole === 'admin' ? 'A' : 'E'}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{appRole === 'admin' ? 'Administrador' : 'Empleado'}</p>
            <p className="text-xs text-gray-500">{appRole === 'admin' ? 'Caja Principal' : 'En Turno'}</p>
          </div>
        </div>
      </div>
      
      <AdminLoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => setIsModalOpen(false)} 
      />
    </aside>
  );
}
