export interface Sale {
  id?: number;
  branch_id: number;
  branch_name?: string;
  product_id: number;
  product_name?: string;
  sku?: string;
  quantity: number;
  total: number;
  sale_date?: string;
}

export interface CreateSaleRequest {
  branchId: number;
  productId: number;
  quantity: number;
  total: number;
  saleDate: string;
}
