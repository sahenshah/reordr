import { useState, useEffect } from 'react';
import BasicTable from './components/BasicTable';
import StickyHeadTable from './components/StickyHeadTable';
import { inventoryColumns, salesColumns, productColumns } from './config/tableConfig';
import type { InventoryData, SalesData, ProductData } from './utils/csvUtils';

function App() {
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productData, setProductData] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from database when component mounts
  useEffect(() => {
    const loadDatabaseData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [inventoryResponse, salesResponse, productsResponse] = await Promise.all([
          fetch('http://localhost:3001/api/inventory'),
          fetch('http://localhost:3001/api/sales'),
          fetch('http://localhost:3001/api/products')
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
        alert('Failed to load data from database');
      } finally {
        setIsLoading(false);
      }
    };

    loadDatabaseData();
  }, []);

  const EmptyStateMessage = ({ message }: { message: string }) => (
    <p style={{ color: '#666', fontStyle: 'italic' }}>{message}</p>
  );

  if (isLoading) {
    return (
      <div className="App" style={{ padding: '20px' }}>
        <h1>ReOrdr: Inventory Management System</h1>
        <p>Loading data from database...</p>
      </div>
    );
  }

  return (
    <div className="App" style={{ padding: '20px' }}>
      <h1>ReOrdr: Inventory Management System</h1>
      
      {/* Products Section */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Products ({productData.length} items)</h2>
        {productData.length > 0 ? (
          <BasicTable 
            data={productData} 
            columns={productColumns}
            getRowKey={(row, index) => `product-${row.sku}-${index}`}
          />
        ) : (
          <EmptyStateMessage message="No product data in database." />
        )}
      </section>
      
      {/* Inventory Section */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Inventory ({inventoryData.length} items)</h2>
        {inventoryData.length > 0 ? (
          <BasicTable 
            data={inventoryData} 
            columns={inventoryColumns}
            getRowKey={(row, index) => `inventory-${row.sku}-${index}`}
          />
        ) : (
          <EmptyStateMessage message="No inventory data in database." />
        )}
      </section>
      
      {/* Sales Section */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Sales ({salesData.length} records)</h2>
        {salesData.length > 0 ? (
          <StickyHeadTable 
            data={salesData} 
            columns={salesColumns}
            getRowKey={(row, index) => `sales-${row.sku}-${index}`}
          />
        ) : (
          <EmptyStateMessage message="No sales data in database." />
        )}
      </section>
    </div>
  );
}

export default App;