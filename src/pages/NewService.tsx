import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Calculator, Trash2, CheckCircle2, Ticket as TicketIcon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../types';

export function NewService() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticket');
  
  const { employees, products, tickets, addServiceToTicket, addRecord } = useStore();
  const activeTicket = tickets.find(t => t.id === ticketId);
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [grossAmount, setGrossAmount] = useState<number | ''>('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [applyTowelDiscount, setApplyTowelDiscount] = useState(false);

  // Derived state
  const employee = employees.find(e => e.id === selectedEmployeeId);
  const employeeServices = employee?.specialCommissions ? ['Regular', ...employee.specialCommissions.map(s => s.serviceName)] : ['Regular'];

  // Handle derived calculations
  const productsTotal = useMemo(() => {
    return selectedProducts.reduce((sum, p) => sum + p.price, 0);
  }, [selectedProducts]);

  const commissionPercentage = useMemo(() => {
    if (!employee) return 0;
    if (selectedServiceName !== 'Regular' && employee.specialCommissions) {
      const special = employee.specialCommissions.find(s => s.serviceName === selectedServiceName);
      if (special) return special.percentage;
    }
    return employee.baseCommission;
  }, [employee, selectedServiceName]);

  const towelDeduction = applyTowelDiscount ? 1000 : 0;
  
  // La toalla se descuenta de la base comisionable del profesional
  const baseForCommission = Math.max(0, (Number(grossAmount) || 0) - productsTotal - towelDeduction);
  const netCommission = baseForCommission * (commissionPercentage / 100);
  
  // La toalla la cobra el salón aparte de la tajada de la comisión
  const salonProfit = (Number(grossAmount) || 0) - netCommission - productsTotal;

  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !grossAmount) return;

    const record = {
      date: new Date().toISOString().split('T')[0],
      employeeId: employee.id,
      serviceName: selectedServiceName === 'Regular' ? 'Servicio General' : selectedServiceName,
      grossAmount: Number(grossAmount),
      productsUsedIds: selectedProducts.map(p => p.id),
      netCommission,
      salonProfit,
      discountTowel: applyTowelDiscount
    };

    if (ticketId && activeTicket) {
      await addServiceToTicket(ticketId, record);
      toast.success(`Servicio añadido a la cuenta de ${activeTicket.clientName}`);
      navigate('/tickets');
      return;
    } else {
      await addRecord(record);
      toast.success('Servicio registrado correctamente ✓');
    }

    // Reset
    setSelectedEmployeeId('');
    setSelectedServiceName('');
    setGrossAmount('');
    setSelectedProducts([]);
    setApplyTowelDiscount(false);
  };

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Calculator className="text-primary w-8 h-8" /> 
          Registrar Operación
        </h1>
        {activeTicket ? (
          <p className="text-primary mt-2 flex items-center gap-2 font-medium">
            <TicketIcon className="w-4 h-4" /> Añadiendo servicio a cuenta de: {activeTicket.clientName}
          </p>
        ) : (
          <p className="text-gray-400 mt-2">Calculadora en tiempo real de comisiones y uso de productos.</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario Izquierdo */}
        <div className="bg-dark-card border border-[#333] rounded-2xl p-6 shadow-2xl">
          <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Empleado Seleccion */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Profesional</label>
              <select 
                title="Seleccionar Profesional"
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setSelectedServiceName('Regular');
                }}
                required
              >
                <option value="">Seleccione un profesional...</option>
                {employees.map(e => (
                   <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            {/* Servicio Específico (si aplica) */}
            {employee && employeeServices.length > 1 && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium text-gray-300">Tipo de Servicio <span className="text-primary text-xs ml-2">(Afecta Comisión)</span></label>
                <select 
                  title="Seleccionar Tipo de Servicio"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  value={selectedServiceName}
                  onChange={(e) => setSelectedServiceName(e.target.value)}
                >
                  {employeeServices.map(s => (
                     <option key={s} value={s}>{s === 'Regular' ? 'General / Tradicional' : s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Monto Bruto */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Precio del Servicio ($)</label>
              <p className="text-xs text-gray-500 mb-1">Si el precio varía, puedes editarlo manualmente.</p>
              <input 
                title="Monto Cobrado"
                type="number" 
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary outline-none text-2xl font-bold"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value ? Number(e.target.value) : '')}
                required
              />
            </div>

            {/* Opciones Adicionales (Blower / Toalla) */}
            <div className="space-y-3 pt-4 border-t border-[#333]">
              <label className="text-sm font-medium text-gray-300">Opciones Especiales</label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={applyTowelDiscount}
                    onChange={(e) => setApplyTowelDiscount(e.target.checked)}
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${applyTowelDiscount ? 'bg-primary' : 'bg-[#333]'}`}>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${applyTowelDiscount ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  Descontar Toalla ($1,000) de la comisión base (Blower)
                </span>
              </label>
            </div>

            {/* Agregar Producto */}
            <div className="space-y-2 pt-4 border-t border-[#333]">
              <label className="text-sm font-medium text-gray-300">Descontar Valle de Productos</label>
              <div className="flex gap-2">
                <select 
                  title="Seleccionar Producto"
                  className="flex-1 bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  onChange={(e) => {
                    if(e.target.value) {
                      handleAddProduct(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Añadir producto gastado...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                  ))}
                </select>
              </div>

              {/* Lista de productos seleccionados */}
              {selectedProducts.length > 0 && (
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2">
                  {selectedProducts.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm">
                      <span className="text-gray-300">{p.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-red-400 font-medium">-${p.price}</span>
                        <button type="button" onClick={() => handleRemoveProduct(idx)} aria-label="Eliminar Producto" className="text-gray-500 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Resumen Derecho (Calculadora en vivo) */}
        <div className="bg-gradient-to-br from-[#1E1E1E] to-[#121212] border border-[#333] rounded-2xl p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="space-y-8 relative z-10">
            <div>
              <h3 className="text-lg font-medium text-gray-400">Resumen de Operación</h3>
              <p className="text-3xl font-bold text-white mt-1">
                ${Number(grossAmount || 0).toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[#333]/50">
                <span className="text-gray-400">Productos ({selectedProducts.length})</span>
                <span className="text-red-400 font-medium">-${productsTotal.toFixed(2)}</span>
              </div>
              {applyTowelDiscount && (
                <div className="flex justify-between items-center pb-4 border-b border-[#333]/50">
                  <span className="text-gray-400">Uso de Toalla</span>
                  <span className="text-red-400 font-medium">-$1000.00</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-4 border-b border-[#333]/50">
                <span className="text-gray-400">Base Comisionable</span>
                <span className="text-white font-medium">${baseForCommission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#333]/50">
                <span className="text-gray-400">
                  Comisión {employee ? employee.name.split(' ')[0] : 'Profesional'} ({commissionPercentage}%)
                </span>
                <span className="text-primary text-xl font-bold">${netCommission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400">Ganancia Salón</span>
                <span className="text-emerald-400 text-xl font-bold">${salonProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            form="service-form"
            disabled={!employee || !grossAmount}
            className="w-full mt-8 bg-primary hover:bg-primary-dark text-dark font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Registrar Servicio
          </button>
        </div>

      </div>
    </div>
  );
}
