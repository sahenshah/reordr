import express from 'express';
import cors from 'cors';
import { initializeDb, seedDatabase, getDatabaseStats } from './db/database';
import { openDb } from './db/database';
import todoRoutes from './routes/todos';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Root route with database stats
app.get('/', async (req, res) => {
  try {
    const stats = await getDatabaseStats();
    res.json({
      message: 'ReOrdr Backend API',
      version: '1.0.0',
      database: stats,
      endpoints: {
        health: '/api/health',
        inventory: '/api/inventory',
        sales: '/api/sales',
        products: '/api/products',
        debug: '/api/debug'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      message: 'ReOrdr Backend API',
      version: '1.0.0',
      error: 'Could not fetch database stats'
    });
  }
});

// Debug endpoint to view all database contents
app.get('/api/debug', async (req, res) => {
  const db = await openDb();
  
  try {
    const products = await db.all('SELECT * FROM products');
    const inventory = await db.all('SELECT * FROM inventory');
    const sales = await db.all('SELECT * FROM sales');
    
    res.json({
      products: products,
      inventory: inventory,
      sales: sales,
      counts: {
        products: products.length,
        inventory: inventory.length,
        sales: sales.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch database contents' });
  } finally {
    await db.close();
  }
});

// Individual table endpoints
app.get('/api/products', async (req, res) => {
  const db = await openDb();
  try {
    const products = await db.all('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  } finally {
    await db.close();
  }
});

app.get('/api/inventory', async (req, res) => {
  const db = await openDb();
  try {
    const inventory = await db.all('SELECT * FROM inventory ORDER BY last_updated DESC');
    res.json({ data: inventory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  } finally {
    await db.close();
  }
});

app.get('/api/sales', async (req, res) => {
  const db = await openDb();
  try {
    const sales = await db.all('SELECT * FROM sales ORDER BY sale_date DESC');
    res.json({ data: sales });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  } finally {
    await db.close();
  }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
  const db = await openDb();
  try {
    const { id } = req.params;
    const { sku, name, description, category, unit_price } = req.body;
    
    await db.run(
      'UPDATE products SET sku = ?, name = ?, description = ?, category = ?, unit_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [sku, name, description, category, unit_price, id]
    );
    
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  } finally {
    await db.close();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'ReOrdr Backend API is running',
        timestamp: new Date().toISOString()
        });
});

initializeDb()
  .then(() => seedDatabase())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server listening at http://localhost:${PORT}`);
      console.log(`📊 View database contents at:`);
      console.log(`   - All data: http://localhost:${PORT}/api/debug`);
      console.log(`   - Products: http://localhost:${PORT}/api/products`);
      console.log(`   - Inventory: http://localhost:${PORT}/api/inventory`);
      console.log(`   - Sales: http://localhost:${PORT}/api/sales`);
    });
  })
  .catch(error => {
    console.error('Failed to start server:', error);
  });
