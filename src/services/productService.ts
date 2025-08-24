import pool from '../config/database';
import { Product } from '../types';

export class ProductService {
  // Get all products for a tenant
  static async getAllProducts(tenantId: string): Promise<Product[]> {
    try {
      const result = await pool.query(`
        SELECT p.*, s.name as supplier_name 
        FROM products p 
        LEFT JOIN suppliers s ON p.supplier_id = s.id 
        WHERE p.tenant_id = $1 
        ORDER BY p.name
      `, [tenantId]);
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        description: row.description,
        category: row.category,
        unit: row.unit,
        price: parseFloat(row.price),
        currency: row.currency,
        supplierId: row.supplier_id?.toString(),
        supplierName: row.supplier_name,
        stockQuantity: row.stock_quantity,
        minStockLevel: row.min_stock_level,
        status: row.status,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Get product by ID
  static async getProductById(id: string, tenantId: string): Promise<Product | null> {
    try {
      const result = await pool.query(`
        SELECT p.*, s.name as supplier_name 
        FROM products p 
        LEFT JOIN suppliers s ON p.supplier_id = s.id 
        WHERE p.id = $1 AND p.tenant_id = $2
      `, [id, tenantId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        description: row.description,
        category: row.category,
        unit: row.unit,
        price: parseFloat(row.price),
        currency: row.currency,
        supplierId: row.supplier_id?.toString(),
        supplierName: row.supplier_name,
        stockQuantity: row.stock_quantity,
        minStockLevel: row.min_stock_level,
        status: row.status,
        createdAt: row.created_at
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  // Create new product
  static async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const result = await pool.query(`
        INSERT INTO products (
          tenant_id, name, description, category, unit, price, currency,
          supplier_id, supplier_name, stock_quantity, min_stock_level, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        product.tenantId, product.name, product.description, product.category,
        product.unit, product.price, product.currency, product.supplierId,
        product.supplierName, product.stockQuantity, product.minStockLevel,
        product.status
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        description: row.description,
        category: row.category,
        unit: row.unit,
        price: parseFloat(row.price),
        currency: row.currency,
        supplierId: row.supplier_id?.toString(),
        supplierName: row.supplier_name,
        stockQuantity: row.stock_quantity,
        minStockLevel: row.min_stock_level,
        status: row.status,
        createdAt: row.created_at
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  // Update product
  static async updateProduct(id: string, product: Partial<Product>, tenantId: string): Promise<Product> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      // Build dynamic update query
      Object.entries(product).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'tenantId' && value !== undefined) {
          const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          fields.push(`${dbField} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
      
      values.push(tenantId, id);
      const result = await pool.query(`
        UPDATE products 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE tenant_id = $${paramCount} AND id = $${paramCount + 1}
        RETURNING *
      `, values);
      
      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        description: row.description,
        category: row.category,
        unit: row.unit,
        price: parseFloat(row.price),
        currency: row.currency,
        supplierId: row.supplier_id?.toString(),
        supplierName: row.supplier_name,
        stockQuantity: row.stock_quantity,
        minStockLevel: row.min_stock_level,
        status: row.status,
        createdAt: row.created_at
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  // Delete product
  static async deleteProduct(id: string, tenantId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM products WHERE id = $1 AND tenant_id = $2',
        [id, tenantId]
      );
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  // Get products by supplier
  static async getProductsBySupplier(supplierId: string, tenantId: string): Promise<Product[]> {
    try {
      const result = await pool.query(`
        SELECT p.*, s.name as supplier_name 
        FROM products p 
        LEFT JOIN suppliers s ON p.supplier_id = s.id 
        WHERE p.supplier_id = $1 AND p.tenant_id = $2 
        ORDER BY p.name
      `, [supplierId, tenantId]);
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        description: row.description,
        category: row.category,
        unit: row.unit,
        price: parseFloat(row.price),
        currency: row.currency,
        supplierId: row.supplier_id?.toString(),
        supplierName: row.supplier_name,
        stockQuantity: row.stock_quantity,
        minStockLevel: row.min_stock_level,
        status: row.status,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching products by supplier:', error);
      throw new Error('Failed to fetch products by supplier');
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string, tenantId: string): Promise<Product[]> {
    try {
      const result = await pool.query(`
        SELECT p.*, s.name as supplier_name 
        FROM products p 
        LEFT JOIN suppliers s ON p.supplier_id = s.id 
        WHERE p.category = $1 AND p.tenant_id = $2 
        ORDER BY p.name
      `, [category, tenantId]);
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        description: row.description,
        category: row.category,
        unit: row.unit,
        price: parseFloat(row.price),
        currency: row.currency,
        supplierId: row.supplier_id?.toString(),
        supplierName: row.supplier_name,
        stockQuantity: row.stock_quantity,
        minStockLevel: row.min_stock_level,
        status: row.status,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error('Failed to fetch products by category');
    }
  }

  // Search products
  static async searchProducts(searchTerm: string, tenantId: string): Promise<Product[]> {
    try {
      const result = await pool.query(`
        SELECT p.*, s.name as supplier_name 
        FROM products p 
        LEFT JOIN suppliers s ON p.supplier_id = s.id 
        WHERE p.tenant_id = $1 
        AND (p.name ILIKE $2 OR p.description ILIKE $2 OR p.category ILIKE $2)
        ORDER BY p.name
      `, [tenantId, `%${searchTerm}%`]);
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        description: row.description,
        category: row.category,
        unit: row.unit,
        price: parseFloat(row.price),
        currency: row.currency,
        supplierId: row.supplier_id?.toString(),
        supplierName: row.supplier_name,
        stockQuantity: row.stock_quantity,
        minStockLevel: row.min_stock_level,
        status: row.status,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  // Get low stock products
  static async getLowStockProducts(tenantId: string): Promise<Product[]> {
    try {
      const result = await pool.query(`
        SELECT p.*, s.name as supplier_name 
        FROM products p 
        LEFT JOIN suppliers s ON p.supplier_id = s.id 
        WHERE p.tenant_id = $1 AND p.stock_quantity <= p.min_stock_level
        ORDER BY p.stock_quantity ASC
      `, [tenantId]);
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        description: row.description,
        category: row.category,
        unit: row.unit,
        price: parseFloat(row.price),
        currency: row.currency,
        supplierId: row.supplier_id?.toString(),
        supplierName: row.supplier_name,
        stockQuantity: row.stock_quantity,
        minStockLevel: row.min_stock_level,
        status: row.status,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw new Error('Failed to fetch low stock products');
    }
  }

  // Update stock quantity
  static async updateStockQuantity(id: string, quantity: number, tenantId: string): Promise<boolean> {
    try {
      const result = await pool.query(`
        UPDATE products 
        SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND tenant_id = $3
      `, [quantity, id, tenantId]);
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error updating stock quantity:', error);
      throw new Error('Failed to update stock quantity');
    }
  }
}
