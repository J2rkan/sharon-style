import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Employee, Product, ServiceRecord, Ticket, AppViewRole } from '../types';

interface AppState {
  appRole: AppViewRole;
  setAppRole: (role: AppViewRole) => void;
  
  isAdminAuthenticated: boolean;
  setAdminAuthenticated: (auth: boolean) => void;

  employees: Employee[];
  products: Product[];
  records: ServiceRecord[];
  tickets: Ticket[];
  isLoading: boolean;

  fetchInitialData: () => Promise<void>;
  
  addRecord: (record: Omit<ServiceRecord, 'id'>) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  markRecordsAsPaid: (recordIds: string[]) => Promise<void>;
  
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  createTicket: (clientName: string) => Promise<Ticket | null>;
  addServiceToTicket: (ticketId: string, service: Omit<ServiceRecord, 'id'>) => Promise<void>;
  closeTicket: (ticketId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  appRole: 'employee',
  setAppRole: (role) => set({ appRole: role }),

  isAdminAuthenticated: false,
  setAdminAuthenticated: (auth) => set({ isAdminAuthenticated: auth }),

  employees: [],
  products: [],
  records: [],
  tickets: [],
  isLoading: false,

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      // Fetch all required data in parallel
      const [
        { data: employees },
        { data: products },
        { data: tickets },
        { data: records }
      ] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('products').select('*'),
        supabase.from('tickets').select('*').eq('status', 'open'),
        supabase.from('service_records').select('*')
      ]);

      if (employees && products && tickets && records) {
        // Map database records back to frontend types
        const mappedEmployees: Employee[] = employees.map(e => ({
          id: e.id,
          name: e.name,
          role: e.role as any,
          baseCommission: e.commissionPercentage,
          fixedSalary: e.fixedSalary,
          specialCommissions: [] // Assuming this gets loaded separately or isn't saved in DB currently
        }));

        const mappedTickets: Ticket[] = tickets.map(t => {
          // Find services for this ticket
          const ticketRecords = records
            .filter(r => r.ticketId === t.id)
            .map(r => ({
              id: r.id,
              date: r.date,
              employeeId: r.employeeId || '',
              serviceName: r.additionalProductsCost ? 'Servicio Multiple' : 'Servicio', // Needs better mapping depending on existing logic
              grossAmount: r.grossAmount,
              productsUsedIds: r.selectedProductIds,
              netCommission: r.netCommission,
              salonProfit: r.grossAmount - r.netCommission,
              paid: r.paid,
              paidAt: r.paidAt || undefined
            }));

          return {
            id: t.id,
            clientName: t.clientName,
            createdAt: t.createdAt,
            status: t.status as 'open' | 'closed',
            services: ticketRecords
          };
        });

        // Records not belonging to an open ticket
        const closedRecords: ServiceRecord[] = records
          .filter(r => !r.ticketId || r.status === 'closed') // Adjust based on how you treat them
          .map(r => ({
              id: r.id,
              date: r.date,
              employeeId: r.employeeId || '',
              serviceName: 'Servicio',
              grossAmount: r.grossAmount,
              productsUsedIds: r.selectedProductIds,
              netCommission: r.netCommission,
              salonProfit: r.grossAmount - r.netCommission,
              paid: r.paid,
              paidAt: r.paidAt || undefined
          }));

        set({
          employees: mappedEmployees,
          products: products as Product[],
          tickets: mappedTickets,
          records: closedRecords,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ isLoading: false });
    }
  },

  addRecord: async (record) => {
    // Optimistic UI could be implemented here, but we'll re-fetch or await for simplicity
    const { data, error } = await supabase.from('service_records').insert({
      employeeId: record.employeeId,
      grossAmount: record.grossAmount,
      netCommission: record.netCommission,
      selectedProductIds: record.productsUsedIds,
      clientName: 'Cliente General', // Need this from UI
      paymentMethod: 'Efectivo', // Need this from UI
      status: 'closed',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
    }).select().single();

    if (!error && data) {
       get().fetchInitialData();
    }
  },

  removeRecord: async (id) => {
    const { error } = await supabase.from('service_records').delete().eq('id', id);
    if (!error) {
       get().fetchInitialData();
    }
  },

  markRecordsAsPaid: async (recordIds) => {
    const { error } = await supabase
      .from('service_records')
      .update({ paid: true, paidAt: new Date().toISOString() })
      .in('id', recordIds);
      
    if (!error) {
       get().fetchInitialData();
    }
  },

  addEmployee: async (employee) => {
    const { error } = await supabase.from('employees').insert({
      name: employee.name,
      role: employee.role,
      commissionPercentage: employee.baseCommission,
      fixedSalary: employee.fixedSalary || 0
    });
    
    if (!error) {
       get().fetchInitialData();
    }
  },

  deleteEmployee: async (id) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) {
       get().fetchInitialData();
    }
  },

  createTicket: async (clientName) => {
    const { data, error } = await supabase.from('tickets').insert({
      clientName,
      status: 'open'
    }).select().single();

    if (!error && data) {
      get().fetchInitialData();
      return {
        id: data.id,
        clientName: data.clientName,
        createdAt: data.createdAt,
        status: 'open',
        services: []
      };
    }
    return null;
  },

  addServiceToTicket: async (ticketId, service) => {
      const { error } = await supabase.from('service_records').insert({
        ticketId: ticketId,
        employeeId: service.employeeId,
        grossAmount: service.grossAmount,
        netCommission: service.netCommission,
        selectedProductIds: service.productsUsedIds,
        clientName: 'Ticket Client',
        paymentMethod: 'Pendiente', 
        status: 'open',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
      });
  
      if (!error) {
         get().fetchInitialData();
      }
  },

  closeTicket: async (ticketId) => {
    // Mark ticket as closed
    await supabase.from('tickets').update({ status: 'closed' }).eq('id', ticketId);
    // Mark associated records as closed/ready for payroll
    await supabase.from('service_records').update({ status: 'closed' }).eq('ticketId', ticketId);
    
    get().fetchInitialData();
  }
}));
