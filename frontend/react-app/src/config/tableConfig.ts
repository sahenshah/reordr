import type { ColumnConfig } from '../components/BasicTable';

// Database field interfaces
interface InventoryData {
  id: number;
  sku: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  last_updated: string;
}

interface SalesData {
  id: number;
  sku: string;
  product_name: string;
  sale_date: string;
  units_sold: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
}

interface ProductData {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export const inventoryColumns: ColumnConfig<InventoryData>[] = [
  { key: 'sku', label: 'SKU', align: 'left' },
  { key: 'product_name', label: 'Product Name', align: 'left' },
  { key: 'current_stock', label: 'Current Stock', align: 'right' },
  { key: 'min_stock_level', label: 'Min Stock', align: 'right' },
  { key: 'max_stock_level', label: 'Max Stock', align: 'right' },
  { 
    key: 'last_updated', 
    label: 'Last Updated', 
    align: 'center',
    format: (value) => value ? new Date(String(value)).toLocaleDateString() : 'N/A'
  },
];

export const salesColumns: ColumnConfig<SalesData>[] = [
  { key: 'sku', label: 'SKU', align: 'left' },
  { key: 'product_name', label: 'Product Name', align: 'left' },
  { 
    key: 'sale_date', 
    label: 'Sale Date', 
    align: 'center',
    format: (value) => value ? new Date(String(value)).toLocaleDateString() : 'N/A'
  },
  { key: 'units_sold', label: 'Units Sold', align: 'right' },
  { 
    key: 'unit_price', 
    label: 'Unit Price', 
    align: 'right',
    format: (value) => value ? `$${Number(value).toFixed(2)}` : '$0.00'
  },
  { 
    key: 'total_amount', 
    label: 'Total Amount', 
    align: 'right',
    format: (value) => value ? `$${Number(value).toFixed(2)}` : '$0.00'
  },
];

export const productColumns: ColumnConfig<ProductData>[] = [
  { key: 'sku', label: 'SKU', align: 'left' },
  { key: 'name', label: 'Product Name', align: 'left' },
  { key: 'description', label: 'Description', align: 'left' },
  { key: 'category', label: 'Category', align: 'left' },
  { 
    key: 'unit_price', 
    label: 'Unit Price', 
    align: 'right',
    format: (value) => value ? `$${Number(value).toFixed(2)}` : '$0.00'
  },
  { 
    key: 'created_at', 
    label: 'Created', 
    align: 'center',
    format: (value) => value ? new Date(String(value)).toLocaleDateString() : 'N/A'
  },
];

