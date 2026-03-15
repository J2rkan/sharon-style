import { useStore } from '../store/useStore';
import { DollarSign, Grip as ClipBoard, PieChart } from 'lucide-react';

export function Dashboard() {
  const { records, employees } = useStore();

  const totalGross = records.reduce((sum, r) => sum + r.grossAmount, 0);
  const totalNetCommissions = records.reduce((sum, r) => sum + r.netCommission, 0);
  const totalSalonProfit = records.reduce((sum, r) => sum + r.salonProfit, 0);
  const totalServices = records.length;

  const employeeStats = employees.map(emp => {
    const empRecords = records.filter(r => r.employeeId === emp.id);
    return {
      id: emp.id,
      name: emp.name,
      role: emp.role,
      servicesCount: empRecords.length,
      generated: empRecords.reduce((sum, r) => sum + r.grossAmount, 0),
      commission: empRecords.reduce((sum, r) => sum + r.netCommission, 0)
    };
  }).filter(stat => stat.servicesCount > 0)
    .sort((a, b) => b.generated - a.generated);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-white tracking-tight">Resumen General</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-dark-card border border-[#333] p-6 rounded-2xl shadow-xl hover:border-primary/50 transition-colors flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/5 rounded-xl">
              <DollarSign className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-400 font-medium tracking-wide text-sm">Caja Total (Bruto)</p>
          </div>
          <p className="text-4xl font-bold text-white">${totalGross.toFixed(2)}</p>
        </div>
        
        {/* Metric 2 */}
        <div className="bg-dark-card border border-[#333] p-6 rounded-2xl shadow-xl hover:border-primary/50 transition-colors flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <ClipBoard className="w-6 h-6 text-primary" />
            </div>
            <p className="text-gray-400 font-medium tracking-wide text-sm">Servicios Atendidos</p>
          </div>
          <p className="text-4xl font-bold text-white">{totalServices}</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-dark-card border border-[#333] p-6 rounded-2xl shadow-xl hover:border-emerald-500/50 transition-colors flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <PieChart className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-gray-400 font-medium tracking-wide text-sm">Utilidad Salón (Neto)</p>
          </div>
          <p className="text-4xl font-bold text-emerald-400">${totalSalonProfit.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Comisiones por Pagar: <span className="text-white">${totalNetCommissions.toFixed(2)}</span></p>
        </div>
      </div>

      {/* Resumen por Profesional */}
      {employeeStats.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2">
          <h2 className="text-xl font-semibold opacity-90 text-white">Desempeño del Personal Hoy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {employeeStats.map(stat => (
              <div key={stat.id} className="bg-[#111] border border-[#333] p-5 rounded-xl flex flex-col justify-between hover:border-primary/30 transition-colors">
                <div>
                  <h3 className="font-bold text-white text-lg truncate">{stat.name.split(' ')[0]}</h3>
                  <p className="text-xs text-gray-500">{stat.role}</p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-400">Total Generado</span>
                    <span className="text-lg font-bold text-white">${stat.generated.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Servicios: {stat.servicesCount}</span>
                    <span className="text-primary font-medium">Comisión: ${stat.commission.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-dark-card border border-[#333] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#333] flex justify-between items-center">
          <h2 className="text-xl font-semibold opacity-90">Últimos Registros</h2>
        </div>
        
        {records.length === 0 ? (
          <div className="p-12 text-center text-gray-500 italic">
            Aún no hay servicios registrados el día de hoy.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a1a] text-sm text-gray-400 uppercase tracking-wider">
                  <th className="p-4 font-medium border-b border-[#333]">Hora</th>
                  <th className="p-4 font-medium border-b border-[#333]">Profesional</th>
                  <th className="p-4 font-medium border-b border-[#333]">Servicio</th>
                  <th className="p-4 font-medium border-b border-[#333] text-right">Monto Bruto</th>
                  <th className="p-4 font-medium border-b border-[#333] text-right">Comisión</th>
                  <th className="p-4 font-medium border-b border-[#333] text-right">Ganancia Salón</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333]">
                {records.slice().reverse().map(record => {
                  const employee = useStore.getState().employees.find(e => e.id === record.employeeId);
                  return (
                    <tr key={record.id} className="hover:bg-white/5 transition-colors text-sm">
                      <td className="p-4 whitespace-nowrap text-gray-400">
                        {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-medium text-gray-200">{employee?.name || 'Desconocido'}</td>
                      <td className="p-4 text-gray-400">
                        <div className="flex items-center gap-2">
                          {record.serviceName}
                          {record.discountTowel && (
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30" title="Descuento aplicado por Uso de Toalla ($1000)">
                             Blower
                           </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium">${record.grossAmount.toFixed(2)}</td>
                      <td className="p-4 text-right text-primary font-medium">${record.netCommission.toFixed(2)}</td>
                      <td className="p-4 text-right text-emerald-400 font-medium">${record.salonProfit.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
