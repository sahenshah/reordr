import { useState, useEffect, useCallback } from 'react';
import type { InventoryData, SalesData, ProductData } from '../utils/csvUtils';

interface DatabaseData {
  inventoryData: InventoryData[];
  salesData: SalesData[];
  productData: ProductData[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const API_BASE_URL = 'http://localhost:3001';

export const useDataLoader = (): DatabaseData => {
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDatabaseData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching data from backend...');
      
      // Fetch all data in parallel
      const [inventoryResponse, salesResponse, productsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/inventory`),
        fetch(`${API_BASE_URL}/api/sales`),
        fetch(`${API_BASE_URL}/api/products`)
      ]);
      
      // Check if responses are ok before parsing JSON
      if (!inventoryResponse.ok) {
        console.error(`Inventory API error: ${inventoryResponse.status}`);
        const errorText = await inventoryResponse.text();
        console.error('Inventory error response:', errorText);
        throw new Error(`Inventory API error: ${inventoryResponse.status}`);
      }
      
      if (!salesResponse.ok) {
        console.error(`Sales API error: ${salesResponse.status}`);
        const errorText = await salesResponse.text();
        console.error('Sales error response:', errorText);
        throw new Error(`Sales API error: ${salesResponse.status}`);
      }
      
      if (!productsResponse.ok) {
        console.error(`Products API error: ${productsResponse.status}`);
        const errorText = await productsResponse.text();
        console.error('Products error response:', errorText);
        throw new Error(`Products API error: ${productsResponse.status}`);
      }
      
      // Parse JSON responses
      const inventoryResult = await inventoryResponse.json();
      const salesResult = await salesResponse.json();
      const productsResult = await productsResponse.json();
      
      setInventoryData(inventoryResult.data || []);
      setSalesData(salesResult.data || []);
      setProductData(productsResult.data || []);
      
      console.log('Database data loaded successfully');
      
    } catch (error: unknown) {
      console.error('Error loading database data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data from database';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Use the same pattern as loadDatabaseData with full URLs
      const [inventoryResponse, salesResponse, productsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/inventory`),
        fetch(`${API_BASE_URL}/api/sales`),
        fetch(`${API_BASE_URL}/api/products`)
      ]);
      
      // Check responses before parsing JSON (same as loadDatabaseData)
      if (!inventoryResponse.ok) {
        throw new Error(`Inventory API error: ${inventoryResponse.status}`);
      }
      if (!salesResponse.ok) {
        throw new Error(`Sales API error: ${salesResponse.status}`);
      }
      if (!productsResponse.ok) {
        throw new Error(`Products API error: ${productsResponse.status}`);
      }
      
      // Parse JSON responses
      const inventoryResult = await inventoryResponse.json();
      const salesResult = await salesResponse.json();
      const productsResult = await productsResponse.json();
      
      setInventoryData(inventoryResult.data || []);
      setSalesData(salesResult.data || []);
      setProductData(productsResult.data || []);
      setError(null);
      
    } catch (err) {
      console.error('Refresh error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to refresh data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    inventoryData,
    salesData,
    productData,
    isLoading,
    error,
    refreshData // ✅ Return the refresh function
  };
};