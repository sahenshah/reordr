export interface InventoryData {
  id: number;
  sku: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  last_updated: string;
}

export interface SalesData {
  id: number;
  sku: string;
  product_name: string;
  sale_date: string;
  units_sold: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
}

export interface ProductData {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit_price: number;
  created_at: string;
  updated_at: string;
}