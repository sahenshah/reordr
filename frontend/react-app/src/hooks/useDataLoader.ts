import { useState, useEffect } from 'react';
import type { InventoryData, SalesData, ProductData } from '../utils/csvUtils';

interface DatabaseData {
  inventoryData: InventoryData[];
  salesData: SalesData[];
  productData: ProductData[];
  isLoading: boolean;
  error: string | null;
}

const API_BASE_URL = 'http://localhost:3001';

export const useDataLoader = (): DatabaseData => {
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDatabaseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [inventoryResponse, salesResponse, productsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/inventory`),
          fetch(`${API_BASE_URL}/api/sales`),
          fetch(`${API_BASE_URL}/api/products`)
        ]);
        
        const inventoryResult = await inventoryResponse.json();
        const salesResult = await salesResponse.json();
        const productsResult = await productsResponse.json();
        
        setInventoryData(inventoryResult.data || []);
        setSalesData(salesResult.data || []);
        setProductData(productsResult.data || []);
        
        console.log('Database data loaded:', {
          inventory: inventoryResult.data?.length || 0,
          sales: salesResult.data?.length || 0,
          products: productsResult.data?.length || 0
        });
        
      } catch (error) {
        console.error('Error loading database data:', error);
        setError('Failed to load data from database');
      } finally {
        setIsLoading(false);
      }
    };

    loadDatabaseData();
  }, []);

  return {
    inventoryData,
    salesData,
    productData,
    isLoading,
    error
  };
};