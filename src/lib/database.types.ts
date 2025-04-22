export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: string;
          name: string;
          price: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          description?: string;
          created_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          employee_id: string;
          customer_name: string;
          date: string;
          total_amount: number;
          discount: number;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          customer_name: string;
          date?: string;
          total_amount: number;
          discount: number;
          notes: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          customer_name?: string;
          date?: string;
          total_amount?: number;
          discount?: number;
          notes?: string;
          created_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          item_id: string;
          quantity: number;
          price_at_sale: number;
          discount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          item_id: string;
          quantity: number;
          price_at_sale: number;
          discount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          item_id?: string;
          quantity?: number;
          price_at_sale?: number;
          discount?: number;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          employee_id: string;
          category: string;
          amount: number;
          date: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          category: string;
          amount: number;
          date?: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          category?: string;
          amount?: number;
          date?: string;
          description?: string;
          created_at?: string;
        };
      };
    };
  };
}