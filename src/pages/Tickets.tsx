import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ReceiptText, Plus, User, Clock, CheckCircle2 } from 'lucide-react';

export function Tickets() {
  const { appRole, tickets, createTicket, closeTicket } = useStore();
  const [newClientName, setNewClientName] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    createTicket(newClientName.trim());
    setNewClientName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <ReceiptText className="text-primary w-8 h-8" /> 
          {appRole === 'admin' ? 'Cuentas por Cobrar' : 'Mis Cuentas Activas'}
        </h1>
        <p className="text-gray-400 mt-2">
          {appRole === 'admin' 
            ? 'Gestión y cobro de los tickets abiertos por los empleados.'
            : 'Abre cuentas a clientes y añádeles tus servicios prestados.'}
        </p>
      </div>

      {appRole === 'employee' && (
        <div className="bg-dark-card border border-[#333] rounded-2xl p-6 shadow-xl max-w-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Abrir Nueva Cuenta</h2>
          <form onSubmit={handleCreateTicket} className="flex gap-4">
            <input
              type="text"
              placeholder="Nombre de la clienta..."
              className="flex-1 bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              required
            />
            <button 
              type="submit"
              className="bg-primary hover:bg-primary-dark text-dark font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" /> Abrir Ticket
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 border border-dashed border-[#333] rounded-2xl">
            No hay cuentas abiertas en este momento.
          </div>
        ) : (
          tickets.map(ticket => {
            const ticketTotal = ticket.services.reduce((sum, s) => sum + s.grossAmount, 0);

            return (
              <div key={ticket.id} className="bg-dark-card border border-[#333] rounded-2xl overflow-hidden shadow-xl flex flex-col">
                <div className="p-5 border-b border-[#333] bg-[#1a1a1a] flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-lg text-white">{ticket.clientName}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md">
                    Abierta
                  </div>
                </div>

                <div className="p-5 flex-1 break-inside-avoid">
                  {ticket.services.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center py-4">Sin servicios añadidos</p>
                  ) : (
                    <div className="space-y-3">
                      {ticket.services.map((s, idx) => {
                        const employee = useStore.getState().employees.find(e => e.id === s.employeeId);
                        return (
                          <div key={idx} className="flex justify-between items-start text-sm border-b border-[#222] pb-2 last:border-0 last:pb-0">
                            <div>
                              <p className="text-gray-300 font-medium">{s.serviceName}</p>
                              <p className="text-xs text-gray-500">{employee?.name.split(' ')[0]}</p>
                            </div>
                            <span className="text-white">${s.grossAmount.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-5 border-t border-[#333] bg-[#111] space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Total a Pagar</span>
                    <span className="text-2xl font-bold text-white">${ticketTotal.toFixed(2)}</span>
                  </div>
                  
                  {appRole === 'admin' ? (
                    <button 
                      onClick={() => closeTicket(ticket.id)}
                      disabled={ticket.services.length === 0}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Cobrar y Cerrar Cuenta
                    </button>
                  ) : (
                    <a href={`/service?ticket=${ticket.id}`} className="block w-full text-center bg-white/5 hover:bg-white/10 border border-[#333] text-white font-medium py-3 px-4 rounded-xl transition-all">
                      Añadir Servicio
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
