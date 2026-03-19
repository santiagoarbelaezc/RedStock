export interface Sale {
  id: number;
  branch_id: number;
  product_id: number;
  quantity: number;
  sale_date: string;
  total: number;
  product_name?: string;
  sku?: string;
}

export interface MonthlySales {
  year: number;
  month: number;
  total_revenue: number;
  total_units: number;
  total_transactions: number;
}

export interface InventoryBehavior {
  totalProducts: number;
  totalUnits: number;
  lowStock: any[];
  outOfStock: any[];
  inventory: any[];
}
