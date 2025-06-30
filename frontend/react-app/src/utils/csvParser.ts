import Papa from 'papaparse';

const API_BASE_URL = 'http://localhost:3001';

// Generic CSV parser that handles any data type
export const parseAndUploadCSV = async <T>(
  file: File,
  endpoint: string,
  dataMapper: (row: any) => T,
  validator: (item: T) => boolean
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Map and validate data
          const parsedData: T[] = results.data
            .map(dataMapper)
            .filter(validator);

          if (parsedData.length === 0) {
            throw new Error('No valid data found in CSV file');
          }

          if (parsedData.length < results.data.length) {
            console.warn(`${results.data.length - parsedData.length} invalid rows were skipped`);
          }

          // Send to backend
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: parsedData }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload data to database');
          }

          const result = await response.json();
          console.log(`${endpoint} upload successful:`, result);
          
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Error reading CSV file: ${error.message}`));
      }
    });
  });
};

// Specific parsers for each data type
export const parseProductsCSV = (file: File) => {
  return parseAndUploadCSV(
    file,
    '/api/products/bulk',
    (row: any) => ({
      sku: String(row.SKU || row.sku || '').trim(),
      name: String(row.Name || row.name || row.ProductName || row.product_name || '').trim(),
      description: String(row.Description || row.description || '').trim(),
      category: String(row.Category || row.category || '').trim(),
      unit_price: parseFloat(row.UnitPrice || row.unit_price || row.Price || row.price || '0') || 0,
    }),
    (item: any) => item.sku && item.name && item.unit_price >= 0
  );
};

export const parseInventoryCSV = (file: File) => {
  return parseAndUploadCSV(
    file,
    '/api/inventory/bulk',
    (row: any) => ({
      sku: String(row.SKU || row.sku || '').trim(),
      product_name: String(row.ProductName || row.product_name || row.Name || row.name || '').trim(),
      current_stock: parseInt(row.CurrentStock || row.current_stock || row.Stock || row.stock || '0') || 0,
      min_stock_level: parseInt(row.MinStock || row.min_stock_level || row.MinStockLevel || '0') || 0,
      max_stock_level: parseInt(row.MaxStock || row.max_stock_level || row.MaxStockLevel || '1000') || 1000,
    }),
    (item: any) => item.sku && item.product_name && item.current_stock >= 0
  );
};

export const parseSalesCSV = (file: File) => {
  return parseAndUploadCSV(
    file,
    '/api/sales/bulk',
    (row: any) => ({
      sku: String(row.SKU || row.sku || '').trim(),
      product_name: String(row.ProductName || row.product_name || row.Name || row.name || '').trim(),
      sale_date: String(row.SaleDate || row.sale_date || row.Date || row.date || '').trim(),
      units_sold: parseInt(row.UnitsSold || row.units_sold || row.Quantity || row.quantity || '0') || 0,
      unit_price: parseFloat(row.UnitPrice || row.unit_price || row.Price || row.price || '0') || 0,
      total_amount: parseFloat(row.TotalAmount || row.total_amount || row.Total || row.total || '0') || 0,
    }),
    (item: any) => item.sku && item.product_name && item.units_sold > 0
  );
};