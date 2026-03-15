import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Shield, Scissors, Sparkles, Gem, Plus, Trash2 } from 'lucide-react';
import { AddEmployeeModal } from '../components/staff/AddEmployeeModal';

export function Staff() {
  const { employees, deleteEmployee, appRole } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
      deleteEmployee(id);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Estilista': return <Scissors className="w-5 h-5" />;
      case 'Manicurista': return <Sparkles className="w-5 h-5" />;
      case 'Administrador':
      case 'Cajera': return <Shield className="w-5 h-5" />;
      default: return <Gem className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Directorio del Personal</h1>
          <p className="text-gray-400 mt-2">Roles, comisiones y configuración.</p>
        </div>
        {appRole === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-dark font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Añadir Empleado
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map(employee => (
          <div key={employee.id} className="bg-dark-card border border-[#333] hover:border-[#555] rounded-2xl p-6 shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/80 to-[#1E1E1E] flex items-center justify-center p-[1px]">
                  <div className="w-full h-full rounded-full bg-dark-card flex items-center justify-center text-primary">
                    {getRoleIcon(employee.role)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-[#1a1a1a] rounded-full text-xs font-medium text-gray-300 border border-[#333]">
                    {employee.role}
                  </div>
                  {appRole === 'admin' && (
                    <button 
                      onClick={() => handleDelete(employee.id, employee.name)}
                      title="Eliminar Empleado"
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <h3 className="font-semibold text-lg text-white mb-1">{employee.name}</h3>
              <p className="text-sm text-gray-400 mb-6 flex items-center gap-2">
                Comisión Base: <span className="text-primary font-bold">{employee.baseCommission}%</span>
              </p>
            </div>

            {employee.specialCommissions && employee.specialCommissions.length > 0 && (
              <div className="mt-auto space-y-2 border-t border-[#333]/50 pt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Comisiones Especiales</span>
                {employee.specialCommissions.map(special => (
                  <div key={special.serviceName} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 truncate max-w-[140px]">{special.serviceName}</span>
                    <span className="text-primary font-medium">{special.percentage}%</span>
                  </div>
                ))}
              </div>
            )}

            {employee.fixedSalary !== undefined && (
              <div className="mt-auto pt-4 border-t border-[#333]/50">
                <div className="bg-white/5 rounded-lg py-2 px-3 text-center text-sm">
                  <span className="text-gray-400 block mb-1">Sueldo Fijo Mensual</span>
                  <span className="text-emerald-400 font-bold">${employee.fixedSalary.toFixed(2)}</span>
                </div>
              </div>
            )}
            
          </div>
        ))}
      </div>
      
      <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
