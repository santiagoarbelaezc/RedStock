export interface InventoryMovement {
  id?: number;
  branch_id: number;
  branch_name?: string;
  product_id: number;
  product_name?: string;
  sku?: string;
  type: 'IN' | 'OUT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  quantity: number;
  reference_id?: number;
  reference_type?: string;
  created_at?: string;
}
