import pool from '../config/database';
import { Order, OrderItem } from '../types';

export class OrderService {
  // Get all orders for a tenant
  static async getAllOrders(tenantId: string): Promise<Order[]> {
    try {
      const result = await pool.query(`
        SELECT o.*, s.name as supplier_name 
        FROM orders o 
        LEFT JOIN suppliers s ON o.supplier_id = s.id 
        WHERE o.tenant_id = $1 
        ORDER BY o.order_date DESC
      `, [tenantId]);
      
      const orders: Order[] = [];
      
      for (const row of result.rows) {
        // Get order items for each order
        const itemsResult = await pool.query(`
          SELECT oi.*, p.name as product_name 
          FROM order_items oi 
          LEFT JOIN products p ON oi.product_id = p.id 
          WHERE oi.order_id = $1
        `, [row.id]);
        
        const items: OrderItem[] = itemsResult.rows.map(itemRow => ({
          id: itemRow.id.toString(),
          productId: itemRow.product_id?.toString(),
          productName: itemRow.product_name,
          quantity: itemRow.quantity,
          unitPrice: parseFloat(itemRow.unit_price),
          totalPrice: parseFloat(itemRow.total_price)
        }));
        
        orders.push({
          id: row.id.toString(),
          tenantId: row.tenant_id,
          orderNumber: row.order_number,
          supplierId: row.supplier_id?.toString(),
          supplierName: row.supplier_name,
          orderDate: row.order_date,
          expectedDeliveryDate: row.expected_delivery_date,
          actualDeliveryDate: row.actual_delivery_date,
          status: row.status,
          totalAmount: parseFloat(row.total_amount),
          items,
          notes: row.notes
        });
      }
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Get order by ID
  static async getOrderById(id: string, tenantId: string): Promise<Order | null> {
    try {
      const orderResult = await pool.query(`
        SELECT o.*, s.name as supplier_name 
        FROM orders o 
        LEFT JOIN suppliers s ON o.supplier_id = s.id 
        WHERE o.id = $1 AND o.tenant_id = $2
      `, [id, tenantId]);
      
      if (orderResult.rows.length === 0) {
        return null;
      }
      
      const orderRow = orderResult.rows[0];
      
      // Get order items
      const itemsResult = await pool.query(`
        SELECT oi.*, p.name as product_name 
        FROM order_items oi 
        LEFT JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = $1
      `, [id]);
      
      const items: OrderItem[] = itemsResult.rows.map(itemRow => ({
        id: itemRow.id.toString(),
        productId: itemRow.product_id?.toString(),
        productName: itemRow.product_name,
        quantity: itemRow.quantity,
        unitPrice: parseFloat(itemRow.unit_price),
        totalPrice: parseFloat(itemRow.total_price)
      }));
      
      return {
        id: orderRow.id.toString(),
        tenantId: orderRow.tenant_id,
        orderNumber: orderRow.order_number,
        supplierId: orderRow.supplier_id?.toString(),
        supplierName: orderRow.supplier_name,
        orderDate: orderRow.order_date,
        expectedDeliveryDate: orderRow.expected_delivery_date,
        actualDeliveryDate: orderRow.actual_delivery_date,
        status: orderRow.status,
        totalAmount: parseFloat(orderRow.total_amount),
        items,
        notes: orderRow.notes
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Create new order
  static async createOrder(order: Omit<Order, 'id'>, items: Omit<OrderItem, 'id'>[]): Promise<Order> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create order
      const orderResult = await client.query(`
        INSERT INTO orders (
          tenant_id, order_number, supplier_id, supplier_name, order_date,
          expected_delivery_date, actual_delivery_date, status, total_amount, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        order.tenantId, order.orderNumber, order.supplierId, order.supplierName,
        order.orderDate, order.expectedDeliveryDate, order.actualDeliveryDate,
        order.status, order.totalAmount, order.notes
      ]);
      
      const orderId = orderResult.rows[0].id;
      
      // Create order items
      for (const item of items) {
        await client.query(`
          INSERT INTO order_items (
            order_id, product_id, product_name, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          orderId, item.productId, item.productName, item.quantity,
          item.unitPrice, item.totalPrice
        ]);
      }
      
      await client.query('COMMIT');
      
      // Return the created order
      return this.getOrderById(orderId.toString(), order.tenantId) as Promise<Order>;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    } finally {
      client.release();
    }
  }

  // Update order
  static async updateOrder(id: string, order: Partial<Order>, tenantId: string): Promise<Order> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      // Build dynamic update query
      Object.entries(order).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'tenantId' && key !== 'items' && value !== undefined) {
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
        UPDATE orders 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE tenant_id = $${paramCount} AND id = $${paramCount + 1}
        RETURNING *
      `, values);
      
      if (result.rows.length === 0) {
        throw new Error('Order not found');
      }
      
      // Return the updated order
      return this.getOrderById(id, tenantId) as Promise<Order>;
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order');
    }
  }

  // Delete order
  static async deleteOrder(id: string, tenantId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM orders WHERE id = $1 AND tenant_id = $2',
        [id, tenantId]
      );
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw new Error('Failed to delete order');
    }
  }

  // Get orders by status
  static async getOrdersByStatus(status: string, tenantId: string): Promise<Order[]> {
    try {
      const result = await pool.query(`
        SELECT o.*, s.name as supplier_name 
        FROM orders o 
        LEFT JOIN suppliers s ON o.supplier_id = s.id 
        WHERE o.status = $1 AND o.tenant_id = $2 
        ORDER BY o.order_date DESC
      `, [status, tenantId]);
      
      const orders: Order[] = [];
      
      for (const row of result.rows) {
        // Get order items for each order
        const itemsResult = await pool.query(`
          SELECT oi.*, p.name as product_name 
          FROM order_items oi 
          LEFT JOIN products p ON oi.product_id = p.id 
          WHERE oi.order_id = $1
        `, [row.id]);
        
        const items: OrderItem[] = itemsResult.rows.map(itemRow => ({
          id: itemRow.id.toString(),
          productId: itemRow.product_id?.toString(),
          productName: itemRow.product_name,
          quantity: itemRow.quantity,
          unitPrice: parseFloat(itemRow.unit_price),
          totalPrice: parseFloat(itemRow.total_price)
        }));
        
        orders.push({
          id: row.id.toString(),
          tenantId: row.tenant_id,
          orderNumber: row.order_number,
          supplierId: row.supplier_id?.toString(),
          supplierName: row.supplier_name,
          orderDate: row.order_date,
          expectedDeliveryDate: row.expected_delivery_date,
          actualDeliveryDate: row.actual_delivery_date,
          status: row.status,
          totalAmount: parseFloat(row.total_amount),
          items,
          notes: row.notes
        });
      }
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw new Error('Failed to fetch orders by status');
    }
  }

  // Get orders by supplier
  static async getOrdersBySupplier(supplierId: string, tenantId: string): Promise<Order[]> {
    try {
      const result = await pool.query(`
        SELECT o.*, s.name as supplier_name 
        FROM orders o 
        LEFT JOIN suppliers s ON o.supplier_id = s.id 
        WHERE o.supplier_id = $1 AND o.tenant_id = $2 
        ORDER BY o.order_date DESC
      `, [supplierId, tenantId]);
      
      const orders: Order[] = [];
      
      for (const row of result.rows) {
        // Get order items for each order
        const itemsResult = await pool.query(`
          SELECT oi.*, p.name as product_name 
          FROM order_items oi 
          LEFT JOIN products p ON oi.product_id = p.id 
          WHERE oi.order_id = $1
        `, [row.id]);
        
        const items: OrderItem[] = itemsResult.rows.map(itemRow => ({
          id: itemRow.id.toString(),
          productId: itemRow.product_id?.toString(),
          productName: itemRow.product_name,
          quantity: itemRow.quantity,
          unitPrice: parseFloat(itemRow.unit_price),
          totalPrice: parseFloat(itemRow.total_price)
        }));
        
        orders.push({
          id: row.id.toString(),
          tenantId: row.tenant_id,
          orderNumber: row.order_number,
          supplierId: row.supplier_id?.toString(),
          supplierName: row.supplier_name,
          orderDate: row.order_date,
          expectedDeliveryDate: row.expected_delivery_date,
          actualDeliveryDate: row.actual_delivery_date,
          status: row.status,
          totalAmount: parseFloat(row.total_amount),
          items,
          notes: row.notes
        });
      }
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders by supplier:', error);
      throw new Error('Failed to fetch orders by supplier');
    }
  }

  // Update order status
  static async updateOrderStatus(id: string, status: string, tenantId: string): Promise<boolean> {
    try {
      const result = await pool.query(`
        UPDATE orders 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND tenant_id = $3
      `, [status, id, tenantId]);
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(tenantId: string) {
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
          SUM(total_amount) as total_spending
        FROM orders 
        WHERE tenant_id = $1
      `, [tenantId]);
      
      return {
        totalOrders: parseInt(stats.rows[0].total_orders) || 0,
        pendingOrders: parseInt(stats.rows[0].pending_orders) || 0,
        shippedOrders: parseInt(stats.rows[0].shipped_orders) || 0,
        deliveredOrders: parseInt(stats.rows[0].delivered_orders) || 0,
        cancelledOrders: parseInt(stats.rows[0].cancelled_orders) || 0,
        totalSpending: parseFloat(stats.rows[0].total_spending) || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }
}
