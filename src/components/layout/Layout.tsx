
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary/30">
      <Sidebar />
      <main className="pl-64 flex flex-col min-h-screen">
        <header className="h-20 border-b border-[#222] bg-dark-card/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold opacity-90 tracking-wide">Panel de Gestión</h2>
          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <div className="flex-1 p-8 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
