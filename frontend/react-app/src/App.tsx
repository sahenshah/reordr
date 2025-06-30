import DataSection from './components/DataSection';
import { inventoryColumns, salesColumns, productColumns } from './config/tableConfig';
import { useDataLoader } from './hooks/useDataLoader';
import { downloadCSV, generateFilename } from './utils/csvDownload';

function App() {
  const { inventoryData, salesData, productData, isLoading, error } = useDataLoader();

  // Upload handlers (placeholder for now)
  const handleProductsUpload = () => {
    alert('Products CSV upload - coming soon!');
  };

  const handleInventoryUpload = () => {
    alert('Inventory CSV upload - coming soon!');
  };

  const handleSalesUpload = () => {
    alert('Sales CSV upload - coming soon!');
  };

  // Download handlers
  const handleProductsDownload = () => {
    downloadCSV(productData, generateFilename('products'));
  };

  const handleInventoryDownload = () => {
    downloadCSV(inventoryData, generateFilename('inventory'));
  };

  const handleSalesDownload = () => {
    downloadCSV(salesData, generateFilename('sales'));
  };

  if (isLoading) {
    return (
      <div className="App" style={{ padding: '20px' }}>
        <h1>ReOrdr: Inventory Management System</h1>
        <p>Loading data from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App" style={{ padding: '20px' }}>
        <h1>ReOrdr: Inventory Management System</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="App" style={{ padding: '20px' }}>
      <h1>ReOrdr: Inventory Management System</h1>
      
      <DataSection
        title="Products"
        data={productData}
        columns={productColumns}
        onUpload={handleProductsUpload}
        onDownload={handleProductsDownload}
        getRowKey={(row, index) => `product-${row.sku}-${index}`}
      />
      
      <DataSection
        title="Inventory"
        data={inventoryData}
        columns={inventoryColumns}
        onUpload={handleInventoryUpload}
        onDownload={handleInventoryDownload}
        getRowKey={(row, index) => `inventory-${row.sku}-${index}`}
      />
      
      <DataSection
        title="Sales"
        data={salesData}
        columns={salesColumns}
        onUpload={handleSalesUpload}
        onDownload={handleSalesDownload}
        getRowKey={(row, index) => `sales-${row.sku}-${index}`}
        useStickyHeader={true}
      />
    </div>
  );
}

export default App;