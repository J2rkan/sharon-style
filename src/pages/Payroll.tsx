import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Calendar, DollarSign, CheckCircle2, History } from 'lucide-react';
import toast from 'react-hot-toast';

export function Payroll() {
  const { employees, records, markRecordsAsPaid } = useStore();
  const [view, setView] = useState<'pending' | 'history'>('pending');

  // Filtrar solo los registros que NO han sido pagados
  const pendingRecords = records.filter(r => !r.paid);
  // Filtrar los que SÍ han sido pagados (para historial)
  const paidRecords = records.filter(r => r.paid);

  // Agrupar los pendientes por empleado
  const pendingPayroll = useMemo(() => {
    return employees.map(emp => {
      const empRecords = pendingRecords.filter(r => r.employeeId === emp.id);
      const totalGenerated = empRecords.reduce((sum, r) => sum + r.grossAmount, 0);
      const totalCommission = empRecords.reduce((sum, r) => sum + r.netCommission, 0);
      
      return {
        ...emp,
        records: empRecords,
        servicesCount: empRecords.length,
        totalGenerated,
        totalCommission,
      };
    }).filter(p => p.servicesCount > 0 || (p.fixedSalary && p.fixedSalary > 0)); 
    // Show if they have services to pay, or if they have a fixed salary (like Cajera)
  }, [employees, pendingRecords]);

  // Agrupar los pagados por empleado para el historial (simplificado)
  const historyPayroll = useMemo(() => {
    return employees.map(emp => {
      const empRecords = paidRecords.filter(r => r.employeeId === emp.id);
      const totalCommission = empRecords.reduce((sum, r) => sum + r.netCommission, 0);
      return {
        ...emp,
        servicesCount: empRecords.length,
        totalCommission,
      };
    }).filter(p => p.servicesCount > 0);
  }, [employees, paidRecords]);

  const handlePayEmployee = (employeeName: string, recordIds: string[]) => {
    if (recordIds.length === 0) {
      toast.error(`${employeeName} no tiene comisiones pendientes.`);
      return;
    }
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-sm">¿Confirmar pago?</p>
          <p className="text-xs text-gray-500">
            Pagando <strong>{recordIds.length}</strong> servicio(s) a <strong>{employeeName}</strong>
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              onClick={() => { markRecordsAsPaid(recordIds); toast.dismiss(t.id); toast.success(`Pago de ${employeeName} registrado ✓`); }}
            >Confirmar</button>
            <button
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >Cancelar</button>
          </div>
        </div>
      ),
      { duration: Infinity, style: { padding: '16px', background: '#1a1a1a', color: '#fff', border: '1px solid #333' } }
    );
  };

  const handlePayAll = () => {
    const allPendingIds = pendingRecords.map(r => r.id);
    if (allPendingIds.length === 0) return;
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-sm">¿Liquidar todo?</p>
          <p className="text-xs text-gray-500">
            Se pagarán <strong>{allPendingIds.length}</strong> servicios pendientes.
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              onClick={() => { markRecordsAsPaid(allPendingIds); toast.dismiss(t.id); toast.success('Liquidación masiva completada ✓'); }}
            >Confirmar Todo</button>
            <button
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >Cancelar</button>
          </div>
        </div>
      ),
      { duration: Infinity, style: { padding: '16px', background: '#1a1a1a', color: '#fff', border: '1px solid #333' } }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Nómina y Pagos</h1>
          <p className="text-gray-400 mt-2">Gestión de comisiones generadas por los profesionales.</p>
        </div>
        
        <div className="flex gap-2 bg-[#111] p-1 rounded-xl border border-[#333]">
          <button 
            onClick={() => setView('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${view === 'pending' ? 'bg-[#222] text-white shadow' : 'text-gray-500 hover:text-white'}`}
          >
            <DollarSign className="w-4 h-4" /> Pagos Pendientes
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${view === 'history' ? 'bg-[#222] text-white shadow' : 'text-gray-500 hover:text-white'}`}
          >
            <History className="w-4 h-4" /> Historial General
          </button>
        </div>
      </div>

      {view === 'pending' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-dark-card border border-primary/20 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-semibold text-white">Periodo de Liquidación</h3>
                <p className="text-xs text-gray-400">Servicios acumulados sin pagar hasta la fecha.</p>
              </div>
            </div>
            {pendingRecords.length > 0 && (
              <button 
                onClick={handlePayAll}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-2 px-6 rounded-xl transition-all border border-emerald-500/20 text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Liquidar Todo
              </button>
            )}
          </div>

          {pendingPayroll.length === 0 ? (
            <div className="text-center py-12 bg-dark-card border border-[#333] rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
              <p className="text-lg text-gray-300 font-medium">No hay nómina pendiente</p>
              <p className="text-sm text-gray-500">Todos los empleados están al día con sus pagos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingPayroll.map(emp => (
                <div key={emp.id} className="bg-dark-card border border-[#333] p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{emp.name}</h3>
                        <p className="text-sm text-gray-400">{emp.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Generado al Salón</p>
                        <p className="text-lg font-bold text-gray-200">${emp.totalGenerated.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="bg-[#111] rounded-xl p-4 mb-6 border border-[#222]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Comisiones por Servicios ({emp.servicesCount})</span>
                        <span className="font-bold text-primary">${emp.totalCommission.toFixed(2)}</span>
                      </div>
                      {emp.fixedSalary && (
                        <div className="flex justify-between items-center pt-2 border-t border-[#333]">
                          <span className="text-sm text-gray-400">Sueldo Fijo Mensual</span>
                          <span className="font-bold text-emerald-400">${emp.fixedSalary.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-auto">
                    <button 
                      onClick={() => handlePayEmployee(emp.name, emp.records.map(r => r.id))}
                      className="bg-primary hover:bg-primary-dark text-dark font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2 w-full justify-center"
                    >
                      <DollarSign className="w-5 h-5" /> Marcar Pagado (Semana) 
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'history' && (
        <div className="bg-dark-card border border-[#333] rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold opacity-90 mb-6">Comisiones Pagadas (Histórico General)</h2>
          {historyPayroll.length === 0 ? (
             <div className="text-center py-8 text-gray-500">Aún no hay historial de pagos registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a1a1a] text-sm text-gray-400 uppercase tracking-wider">
                    <th className="p-4 font-medium border-b border-[#333]">Profesional</th>
                    <th className="p-4 font-medium border-b border-[#333]">Rol</th>
                    <th className="p-4 font-medium border-b border-[#333] text-right">Servicios Totales</th>
                    <th className="p-4 font-medium border-b border-[#333] text-right">Comisiones Totales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                  {historyPayroll.map(emp => (
                    <tr key={emp.id} className="hover:bg-white/5 transition-colors text-sm">
                      <td className="p-4 font-medium text-gray-200">{emp.name}</td>
                      <td className="p-4 text-gray-400">{emp.role}</td>
                      <td className="p-4 text-right">{emp.servicesCount}</td>
                      <td className="p-4 text-right text-emerald-400 font-medium">${emp.totalCommission.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
