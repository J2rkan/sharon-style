import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Role, SpecialCommission } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES: Role[] = [
  'Estilista', 'Manicurista', 'Barbero', 'Quiropedista', 
  'Cosmetologa', 'Laser', 'Auxiliar', 'Cajera'
];

export function AddEmployeeModal({ isOpen, onClose }: Props) {
  const { addEmployee } = useStore();
  
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Estilista');
  const [baseCommission, setBaseCommission] = useState<number>(50);
  const [fixedSalary, setFixedSalary] = useState<number | ''>('');
  const [specialCommissions, setSpecialCommissions] = useState<SpecialCommission[]>([]);
  
  // temporary states for new special commission
  const [specName, setSpecName] = useState('');
  const [specPercent, setSpecPercent] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleAddSpecial = () => {
    if (specName && specPercent !== '') {
      setSpecialCommissions([
        ...specialCommissions, 
        { serviceName: specName, percentage: Number(specPercent) }
      ]);
      setSpecName('');
      setSpecPercent('');
    }
  };

  const handleRemoveSpecial = (idx: number) => {
    setSpecialCommissions(specialCommissions.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addEmployee({
      id: crypto.randomUUID(),
      name,
      role,
      baseCommission,
      specialCommissions: specialCommissions.length > 0 ? specialCommissions : undefined,
      fixedSalary: fixedSalary !== '' ? Number(fixedSalary) : undefined,
    });

    // Reset and close
    setName('');
    setRole('Estilista');
    setBaseCommission(50);
    setFixedSalary('');
    setSpecialCommissions([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-dark-card border border-[#333] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-[#333] bg-[#1a1a1a]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Nuevo Empleado
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Nombre Completo</label>
                <input 
                  type="text" required autoFocus
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary outline-none mt-1"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Rol principal</label>
                  <select 
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary outline-none mt-1"
                    value={role} onChange={(e) => setRole(e.target.value as Role)}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Comisión Base (%)</label>
                  <input 
                    type="number" required min="0" max="100"
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary outline-none mt-1"
                    value={baseCommission} onChange={(e) => setBaseCommission(Number(e.target.value))}
                  />
                </div>
              </div>

              {role === 'Cajera' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-medium text-gray-300">Sueldo Fijo ($)</label>
                  <input 
                    type="number" min="0" step="0.01" required
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary outline-none mt-1"
                    value={fixedSalary} onChange={(e) => setFixedSalary(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-[#333]">
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Comisiones Especiales (Opcional)
                </label>
                <p className="text-xs text-gray-500 mb-3">Añade tarifas de servicios específicos si varían de la base general (Ej. Dipin 60%).</p>
                
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" placeholder="Servicio (ej. Dipin)" 
                    className="flex-1 bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-white text-sm focus:border-primary outline-none"
                    value={specName} onChange={(e) => setSpecName(e.target.value)}
                  />
                  <input 
                    type="number" placeholder="%" min="0" max="100"
                    className="w-20 bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-white text-sm focus:border-primary outline-none"
                    value={specPercent} onChange={(e) => setSpecPercent(e.target.value ? Number(e.target.value) : '')}
                  />
                  <button 
                    type="button" onClick={handleAddSpecial}
                    disabled={!specName || specPercent === ''}
                    className="bg-primary/20 hover:bg-primary/30 text-primary px-3 rounded-xl disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {specialCommissions.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {specialCommissions.map((sc, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[#1a1a1a] p-2 rounded-lg border border-[#333] text-sm">
                        <span className="text-gray-300">{sc.serviceName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-bold">{sc.percentage}%</span>
                          <button type="button" onClick={() => handleRemoveSpecial(idx)} className="text-gray-500 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="flex gap-3 pt-4 border-t border-[#333]">
              <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl text-white hover:bg-white/5 font-medium transition-colors">
                Cancelar
              </button>
              <button type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-dark font-bold py-3 px-4 rounded-xl shadow-lg transition-all">
                Guardar Empleado
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
