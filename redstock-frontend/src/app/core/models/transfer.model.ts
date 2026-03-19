export type TransferStatus = 'PENDING' | 'IN_TRANSIT' | 'RECEIVED' | 'PARTIAL';

export interface TransferItem {
  id: number;
  transfer_id: number;
  product_id: number;
  requested_qty: number;
  received_qty?: number;
  notes?: string;
  product_name: string;
  sku: string;
}

export interface Transfer {
  id: number;
  origin_branch_id: number;
  destination_branch_id: number;
  status: TransferStatus;
  requested_at: string;
  received_at?: string;
  origin_branch_name?: string;
  destination_branch_name?: string;
  items?: TransferItem[];
}

export interface CreateTransferItem {
  productId: number;
  requestedQty: number;
}
