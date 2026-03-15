export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          name: string
          role: string
          commissionPercentage: number
          fixedSalary: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          commissionPercentage?: number
          fixedSalary?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          commissionPercentage?: number
          fixedSalary?: number
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          type?: string
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          clientName: string
          status: string
          createdAt: string
        }
        Insert: {
          id?: string
          clientName: string
          status?: string
          createdAt?: string
        }
        Update: {
          id?: string
          clientName?: string
          status?: string
          createdAt?: string
        }
      }
      service_records: {
        Row: {
          id: string
          clientName: string
          employeeId: string | null
          selectedProductIds: string[]
          additionalProductsCost: number
          totalServicesCost: number
          grossAmount: number
          netCommission: number
          paymentMethod: string
          date: string
          time: string
          status: string
          ticketId: string | null
          paid: boolean
          paidAt: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clientName: string
          employeeId?: string | null
          selectedProductIds?: string[]
          additionalProductsCost?: number
          totalServicesCost?: number
          grossAmount?: number
          netCommission?: number
          paymentMethod: string
          date: string
          time: string
          status: string
          ticketId?: string | null
          paid?: boolean
          paidAt?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clientName?: string
          employeeId?: string | null
          selectedProductIds?: string[]
          additionalProductsCost?: number
          totalServicesCost?: number
          grossAmount?: number
          netCommission?: number
          paymentMethod?: string
          date?: string
          time?: string
          status?: string
          ticketId?: string | null
          paid?: boolean
          paidAt?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
