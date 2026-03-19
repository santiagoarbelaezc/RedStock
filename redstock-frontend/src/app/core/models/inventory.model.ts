export interface InventoryItem {
  id: number;
  branch_id: number;
  product_id: number;
  quantity: number;
  updated_at: string;
  product_name: string;
  sku: string;
  description?: string;
  branch_name?: string;
  address?: string;
}
