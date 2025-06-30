import { useRef } from 'react';
import DataSection from './components/DataSection';
import { inventoryColumns, salesColumns, productColumns } from './config/tableConfig';
import { useDataLoader } from './hooks/useDataLoader';
import { downloadCSV, generateFilename } from './utils/csvDownload';
import { parseProductsCSV, parseInventoryCSV, parseSalesCSV } from './utils/csvParser';

function App() {
  const { inventoryData, salesData, productData, isLoading, error, refreshData } = useDataLoader();
  
  // Create refs for file inputs
  const productsFileInputRef = useRef<HTMLInputElement>(null);
  const inventoryFileInputRef = useRef<HTMLInputElement>(null);
  const salesFileInputRef = useRef<HTMLInputElement>(null);

  // Upload handlers - these will trigger file selection windows
  const handleProductsUpload = () => {
    productsFileInputRef.current?.click();
  };

  const handleInventoryUpload = () => {
    inventoryFileInputRef.current?.click();
  };

  const handleSalesUpload = () => {
    salesFileInputRef.current?.click();
  };

  // File change handlers - these will process the selected files
  const handleProductsFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Uploading products CSV...');
      await parseProductsCSV(file);

      console.log('Upload successful, refreshing data...');
      // This will automatically trigger the loading state in useDataLoader
      await refreshData();
      alert('Products uploaded successfully!');

    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Error uploading Products CSV: ${err.message}`);
    } finally {
      // Reset the file input
      if (productsFileInputRef.current) {
        productsFileInputRef.current.value = '';
      }
    }
  };

  const handleInventoryFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Uploading inventory CSV...');
      await parseInventoryCSV(file);

      console.log('Upload successful, refreshing data...');
      // This will automatically trigger the loading state in useDataLoader
      await refreshData();
      alert('Inventory uploaded successfully!');

    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Error uploading Inventory CSV: ${err.message}`);
    } finally {
      // Reset the file input
      if (inventoryFileInputRef.current) {
        inventoryFileInputRef.current.value = '';
      }
    }
  };

  const handleSalesFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Uploading sales CSV...');
      await parseSalesCSV(file);

      console.log('Upload successful, refreshing data...');
      // This will automatically trigger the loading state in useDataLoader
      await refreshData();
      alert('Sales uploaded successfully!');

    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Error uploading Sales CSV: ${err.message}`);
    } finally {
      // Reset the file input
      if (salesFileInputRef.current) {
        salesFileInputRef.current.value = '';
      }
    }
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
      {/* Hidden file inputs */}
      <input
        ref={productsFileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleProductsFileChange}
      />
      <input
        ref={inventoryFileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleInventoryFileChange}
      />
      <input
        ref={salesFileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleSalesFileChange}
      />

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