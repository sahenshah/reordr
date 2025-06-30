import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open the SQLite database
export const openDb = () => {
  return open({
    filename: './db.sqlite',
    driver: sqlite3.Database,
  });
};

// Initialize all tables
export const initializeDb = async () => {
  const db = await openDb();
  
  try {
    // Create Product table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        unit_price DECIMAL(10, 2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Inventory table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL,
        product_name TEXT NOT NULL,
        current_stock INTEGER NOT NULL DEFAULT 0,
        min_stock_level INTEGER DEFAULT 0,
        max_stock_level INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sku) REFERENCES products(sku) ON DELETE CASCADE
      )
    `);

    // Create Sales table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL,
        product_name TEXT NOT NULL,
        sale_date DATE NOT NULL,
        units_sold INTEGER NOT NULL,
        unit_price DECIMAL(10, 2),
        total_amount DECIMAL(10, 2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sku) REFERENCES products(sku) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
      CREATE INDEX IF NOT EXISTS idx_sales_sku ON sales(sku);
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    `);

    console.log('✅ Database tables initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await db.close();
  }
};

// Optional: Add some sample data for testing
export const seedDatabase = async () => {
  const db = await openDb();
  
  try {
    // Check if data already exists
    const productCount = await db.get('SELECT COUNT(*) as count FROM products');
    
    if (productCount.count === 0) {
      // Insert sample products
      await db.exec(`
        INSERT INTO products (sku, name, description, category, unit_price) VALUES
        ('SKU001', 'Widget A', 'High quality widget', 'Electronics', 29.99),
        ('SKU002', 'Widget B', 'Premium widget', 'Electronics', 49.99),
        ('SKU003', 'Gadget X', 'Useful gadget', 'Tools', 19.99);
      `);

      // Insert sample inventory
      await db.exec(`
        INSERT INTO inventory (sku, product_name, current_stock, min_stock_level, max_stock_level) VALUES
        ('SKU001', 'Widget A', 100, 10, 500),
        ('SKU002', 'Widget B', 75, 5, 300),
        ('SKU003', 'Gadget X', 200, 20, 1000);
      `);

      // Insert sample sales
      await db.exec(`
        INSERT INTO sales (sku, product_name, sale_date, units_sold, unit_price, total_amount) VALUES
        ('SKU001', 'Widget A', '2024-06-25', 5, 29.99, 149.95),
        ('SKU002', 'Widget B', '2024-06-26', 3, 49.99, 149.97),
        ('SKU003', 'Gadget X', '2024-06-27', 10, 19.99, 199.90),
        ('SKU001', 'Widget A', '2024-06-28', 2, 29.99, 59.98);
      `);

      console.log('✅ Sample data inserted successfully');
    }
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await db.close();
  }
};

// Utility function to get database stats
export const getDatabaseStats = async () => {
  const db = await openDb();
  
  try {
    const stats = await db.all(`
      SELECT 
        'products' as table_name, COUNT(*) as count FROM products
      UNION ALL
      SELECT 
        'inventory' as table_name, COUNT(*) as count FROM inventory
      UNION ALL
      SELECT 
        'sales' as table_name, COUNT(*) as count FROM sales
    `);
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    throw error;
  } finally {
    await db.close();
  }
};
