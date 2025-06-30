from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import pandas as pd
import os
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Database path
DB_PATH = 'reordr.db'

def get_db_connection():
    """Create a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

def init_database():
    """Initialize the database with tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            unit_price REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create inventory table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT UNIQUE NOT NULL,
            product_name TEXT,
            current_stock INTEGER,
            min_stock_level INTEGER,
            max_stock_level INTEGER,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create sales table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT NOT NULL,
            product_name TEXT,
            sale_date DATE,
            units_sold INTEGER,
            unit_price REAL,
            total_amount REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully")

def seed_database():
    """Seed the database with sample data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Sample products
    sample_products = [
        ('WIDGET001', 'Premium Widget', 'High-quality widget for professional use', 'Electronics', 29.99),
        ('GADGET002', 'Basic Gadget', 'Standard gadget for everyday tasks', 'Tools', 15.50),
        ('TOOL003', 'Super Tool', 'Professional-grade tool', 'Tools', 45.00)
    ]
    
    # Sample inventory
    sample_inventory = [
        ('WIDGET001', 'Premium Widget', 100, 10, 500),
        ('GADGET002', 'Basic Gadget', 50, 5, 200),
        ('TOOL003', 'Super Tool', 25, 3, 100)
    ]
    
    # Sample sales
    sample_sales = [
        ('WIDGET001', 'Premium Widget', '2024-01-15', 5, 29.99, 149.95),
        ('GADGET002', 'Basic Gadget', '2024-01-16', 3, 15.50, 46.50),
        ('TOOL003', 'Super Tool', '2024-01-17', 2, 45.00, 90.00)
    ]
    
    try:
        # Insert sample data
        cursor.executemany(
            'INSERT OR IGNORE INTO products (sku, name, description, category, unit_price) VALUES (?, ?, ?, ?, ?)',
            sample_products
        )
        
        cursor.executemany(
            'INSERT OR IGNORE INTO inventory (sku, product_name, current_stock, min_stock_level, max_stock_level) VALUES (?, ?, ?, ?, ?)',
            sample_inventory
        )
        
        cursor.executemany(
            'INSERT OR IGNORE INTO sales (sku, product_name, sale_date, units_sold, unit_price, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
            sample_sales
        )
        
        conn.commit()
        print("Database seeded successfully")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        conn.close()

# Routes
@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information"""
    conn = get_db_connection()
    try:
        # Get database stats
        products_count = conn.execute('SELECT COUNT(*) FROM products').fetchone()[0]
        inventory_count = conn.execute('SELECT COUNT(*) FROM inventory').fetchone()[0]
        sales_count = conn.execute('SELECT COUNT(*) FROM sales').fetchone()[0]
        
        return jsonify({
            'message': 'ReOrdr Backend API (Python)',
            'version': '1.0.0',
            'database': {
                'products': products_count,
                'inventory': inventory_count,
                'sales': sales_count
            },
            'endpoints': {
                'health': '/api/health',
                'inventory': '/api/inventory',
                'sales': '/api/sales',
                'products': '/api/products',
                'debug': '/api/debug',
                'bulk_products': '/api/products/bulk',
                'bulk_inventory': '/api/inventory/bulk',
                'bulk_sales': '/api/sales/bulk'
            },
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'message': 'ReOrdr Backend API (Python)',
            'version': '1.0.0',
            'error': f'Could not fetch database stats: {str(e)}'
        })
    finally:
        conn.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'message': 'ReOrdr Backend API is running (Python)',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/debug', methods=['GET'])
def debug():
    """Debug endpoint to view all database contents"""
    conn = get_db_connection()
    try:
        products = [dict(row) for row in conn.execute('SELECT * FROM products').fetchall()]
        inventory = [dict(row) for row in conn.execute('SELECT * FROM inventory').fetchall()]
        sales = [dict(row) for row in conn.execute('SELECT * FROM sales').fetchall()]
        
        return jsonify({
            'products': products,
            'inventory': inventory,
            'sales': sales,
            'counts': {
                'products': len(products),
                'inventory': len(inventory),
                'sales': len(sales)
            }
        })
    except Exception as e:
        return jsonify({'error': f'Failed to fetch database contents: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products"""
    conn = get_db_connection()
    try:
        products = conn.execute('SELECT * FROM products ORDER BY created_at DESC').fetchall()
        return jsonify({'data': [dict(row) for row in products]})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch products: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    """Get all inventory"""
    conn = get_db_connection()
    try:
        inventory = conn.execute('SELECT * FROM inventory ORDER BY last_updated DESC').fetchall()
        return jsonify({'data': [dict(row) for row in inventory]})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch inventory: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/api/sales', methods=['GET'])
def get_sales():
    """Get all sales"""
    conn = get_db_connection()
    try:
        sales = conn.execute('SELECT * FROM sales ORDER BY sale_date DESC').fetchall()
        return jsonify({'data': [dict(row) for row in sales]})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch sales: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/api/products/bulk', methods=['POST'])
def bulk_insert_products():
    """Bulk insert products data (replaces all existing data)"""
    try:
        data = request.get_json()
        
        if not data or 'data' not in data:
            return jsonify({'error': 'No data provided'}), 400
        
        products_data = data['data']
        
        if not isinstance(products_data, list) or len(products_data) == 0:
            return jsonify({'error': 'No valid products data provided'}), 400
        
        print(f"Received {len(products_data)} products for bulk insert")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Clear existing products data
            cursor.execute('DELETE FROM products')
            print('Cleared existing products data')
            
            # Insert new data
            insert_count = 0
            for item in products_data:
                try:
                    cursor.execute('''
                        INSERT INTO products (sku, name, description, category, unit_price)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (
                        item.get('sku', ''),
                        item.get('name', ''),
                        item.get('description', ''),
                        item.get('category', ''),
                        item.get('unit_price', 0)
                    ))
                    insert_count += 1
                except Exception as e:
                    print(f"Error inserting product {item.get('sku', 'unknown')}: {e}")
            
            conn.commit()
            print(f"Bulk insert completed. Inserted {insert_count} products")
            
            return jsonify({
                'success': True,
                'message': 'Products bulk insert completed',
                'insertedCount': insert_count,
                'totalReceived': len(products_data)
            })
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
            
    except Exception as e:
        print(f"Error in bulk products insert: {e}")
        return jsonify({'error': f'Failed to bulk insert products: {str(e)}'}), 500

@app.route('/api/inventory/bulk', methods=['POST'])
def bulk_insert_inventory():
    """Bulk insert inventory data (replaces all existing data)"""
    try:
        data = request.get_json()
        
        if not data or 'data' not in data:
            return jsonify({'error': 'No data provided'}), 400
        
        inventory_data = data['data']
        
        if not isinstance(inventory_data, list) or len(inventory_data) == 0:
            return jsonify({'error': 'No valid inventory data provided'}), 400
        
        print(f"Received {len(inventory_data)} inventory items for bulk insert")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Clear existing inventory data
            cursor.execute('DELETE FROM inventory')
            print('Cleared existing inventory data')
            
            # Insert new data
            insert_count = 0
            for item in inventory_data:
                try:
                    cursor.execute('''
                        INSERT INTO inventory (sku, product_name, current_stock, min_stock_level, max_stock_level)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (
                        item.get('sku', ''),
                        item.get('product_name', ''),
                        item.get('current_stock', 0),
                        item.get('min_stock_level', 0),
                        item.get('max_stock_level', 0)
                    ))
                    insert_count += 1
                except Exception as e:
                    print(f"Error inserting inventory {item.get('sku', 'unknown')}: {e}")
            
            conn.commit()
            print(f"Bulk insert completed. Inserted {insert_count} inventory items")
            
            return jsonify({
                'success': True,
                'message': 'Inventory bulk insert completed',
                'insertedCount': insert_count,
                'totalReceived': len(inventory_data)
            })
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
            
    except Exception as e:
        print(f"Error in bulk inventory insert: {e}")
        return jsonify({'error': f'Failed to bulk insert inventory: {str(e)}'}), 500

@app.route('/api/sales/bulk', methods=['POST'])
def bulk_insert_sales():
    """Bulk insert sales data (replaces all existing data)"""
    try:
        data = request.get_json()
        
        if not data or 'data' not in data:
            return jsonify({'error': 'No data provided'}), 400
        
        sales_data = data['data']
        
        if not isinstance(sales_data, list) or len(sales_data) == 0:
            return jsonify({'error': 'No valid sales data provided'}), 400
        
        print(f"Received {len(sales_data)} sales records for bulk insert")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Clear existing sales data
            cursor.execute('DELETE FROM sales')
            print('Cleared existing sales data')
            
            # Insert new data
            insert_count = 0
            for item in sales_data:
                try:
                    cursor.execute('''
                        INSERT INTO sales (sku, product_name, sale_date, units_sold, unit_price, total_amount)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        item.get('sku', ''),
                        item.get('product_name', ''),
                        item.get('sale_date', ''),
                        item.get('units_sold', 0),
                        item.get('unit_price', 0),
                        item.get('total_amount', 0)
                    ))
                    insert_count += 1
                except Exception as e:
                    print(f"Error inserting sales {item.get('sku', 'unknown')}: {e}")
            
            conn.commit()
            print(f"Bulk insert completed. Inserted {insert_count} sales records")
            
            return jsonify({
                'success': True,
                'message': 'Sales bulk insert completed',
                'insertedCount': insert_count,
                'totalReceived': len(sales_data)
            })
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
            
    except Exception as e:
        print(f"Error in bulk sales insert: {e}")
        return jsonify({'error': f'Failed to bulk insert sales: {str(e)}'}), 500
    
if __name__ == '__main__':
    print("Initializing database...")
    init_database()
    print("Seeding database...")
    seed_database()
    
    print("🚀 Starting Python Flask server...")
    print("📊 View database contents at:")
    print("   - All data: http://localhost:3001/api/debug")
    print("   - Products: http://localhost:3001/api/products")
    print("   - Inventory: http://localhost:3001/api/inventory")
    print("   - Sales: http://localhost:3001/api/sales")
    
    app.run(debug=True, host='0.0.0.0', port=3001)