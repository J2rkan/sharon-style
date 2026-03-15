export type Role =
  | 'Estilista'
  | 'Manicurista'
  | 'Barbero'
  | 'Quiropedista'
  | 'Cosmetologa'
  | 'Laser'
  | 'Auxiliar'
  | 'Cajera';

export interface SpecialCommission {
  serviceName: string; // e.g., 'Semi permanentes', 'Dipin', 'Cerquillo'
  percentage: number; // e.g., 40, 60
}

export interface Employee {
  id: string;
  name: string;
  role: Role;
  baseCommission: number; // Percentage, e.g., 50 for Estilista, 0 for Cajera
  specialCommissions?: SpecialCommission[];
  fixedSalary?: number; // For Cajera
}

export type ProductType = 'Quimico' | 'Accesorio' | 'Otro';

export interface Product {
  id: string;
  name: string;
  price: number; // Deducted mapped price (Valle de productos)
  type: ProductType;
}

export interface ServiceRecord {
  id: string;
  date: string; // ISO String
  employeeId: string;
  serviceName: string;
  grossAmount: number; // Total charged to the client
  productsUsedIds: string[]; // List of product IDs used for deduction
  netCommission: number; // The calculated commission for the employee
  salonProfit: number; // The remaining amount for the salon
  discountTowel?: boolean; // Flag if "Blower" $1000 towel discount applies
  paid?: boolean; // Indicates if the commission was paid to the employee
  paidAt?: string; // Date when the commission was paid
}

export interface Ticket {
  id: string;
  clientName: string;
  createdAt: string; // ISO String
  status: 'open' | 'closed';
  services: ServiceRecord[];
}

export type AppViewRole = 'employee' | 'admin';
