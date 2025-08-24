import pool from './database';
import { mockSuppliers, mockProducts, mockOrders } from '../data/mockData';
import fs from 'fs';
import path from 'path';

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('Database schema created successfully');
    
    // Insert mock data
    await insertMockData();
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function insertMockData() {
  try {
    // Insert suppliers
    for (const supplier of mockSuppliers) {
      const result = await pool.query(`
        INSERT INTO suppliers (
          tenant_id, name, email, phone, address, city, country, postal_code,
          category, status, rating, contact_person, website, tax_id,
          registration_date, last_contact_date, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `, [
        supplier.tenantId, supplier.name, supplier.email, supplier.phone,
        supplier.address, supplier.city, supplier.country, supplier.postalCode,
        supplier.category, supplier.status, supplier.rating, supplier.contactPerson,
        supplier.website, supplier.taxId, supplier.registrationDate,
        supplier.lastContactDate, supplier.notes
      ]);
      
      // Update the supplier ID for products reference
      supplier.id = result.rows[0].id.toString();
    }
    
    // Insert products
    for (const product of mockProducts) {
      await pool.query(`
        INSERT INTO products (
          tenant_id, name, description, category, unit, price, currency,
          supplier_id, supplier_name, stock_quantity, min_stock_level, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        product.tenantId, product.name, product.description, product.category,
        product.unit, product.price, product.currency, product.supplierId,
        product.supplierName, product.stockQuantity, product.minStockLevel,
        product.status
      ]);
    }
    
    // Insert orders
    for (const order of mockOrders) {
      const orderResult = await pool.query(`
        INSERT INTO orders (
          tenant_id, order_number, supplier_id, supplier_name, order_date,
          expected_delivery_date, actual_delivery_date, status, total_amount, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        order.tenantId, order.orderNumber, order.supplierId, order.supplierName,
        order.orderDate, order.expectedDeliveryDate, order.actualDeliveryDate,
        order.status, order.totalAmount, order.notes
      ]);
      
      const orderId = orderResult.rows[0].id;
      
      // Insert order items
      for (const item of order.items) {
        await pool.query(`
          INSERT INTO order_items (
            order_id, product_id, product_name, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          orderId, item.productId, item.productName, item.quantity,
          item.unitPrice, item.totalPrice
        ]);
      }
    }
    
    console.log('Mock data inserted successfully');
  } catch (error) {
    console.error('Error inserting mock data:', error);
    throw error;
  }
}

export async function closeDatabase() {
  await pool.end();
}
