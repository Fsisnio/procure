import pool from '../config/database';
import { Supplier } from '../types';

export class SupplierService {
  // Get all suppliers for a tenant
  static async getAllSuppliers(tenantId: string): Promise<Supplier[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM suppliers WHERE tenant_id = $1 ORDER BY name',
        [tenantId]
      );
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        country: row.country,
        postalCode: row.postal_code,
        category: row.category,
        status: row.status,
        rating: parseFloat(row.rating) || 0,
        contactPerson: row.contact_person,
        website: row.website,
        taxId: row.tax_id,
        registrationDate: row.registration_date,
        lastContactDate: row.last_contact_date,
        notes: row.notes
      }));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error('Failed to fetch suppliers');
    }
  }

  // Get supplier by ID
  static async getSupplierById(id: string, tenantId: string): Promise<Supplier | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM suppliers WHERE id = $1 AND tenant_id = $2',
        [id, tenantId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        country: row.country,
        postalCode: row.postal_code,
        category: row.category,
        status: row.status,
        rating: parseFloat(row.rating) || 0,
        contactPerson: row.contact_person,
        website: row.website,
        taxId: row.tax_id,
        registrationDate: row.registration_date,
        lastContactDate: row.last_contact_date,
        notes: row.notes
      };
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw new Error('Failed to fetch supplier');
    }
  }

  // Create new supplier
  static async createSupplier(supplier: Omit<Supplier, 'id' | 'registrationDate'>): Promise<Supplier> {
    try {
      const result = await pool.query(`
        INSERT INTO suppliers (
          tenant_id, name, email, phone, address, city, country, postal_code,
          category, status, rating, contact_person, website, tax_id,
          registration_date, last_contact_date, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `, [
        supplier.tenantId, supplier.name, supplier.email, supplier.phone,
        supplier.address, supplier.city, supplier.country, supplier.postalCode,
        supplier.category, supplier.status, supplier.rating, supplier.contactPerson,
        supplier.website, supplier.taxId, new Date(), // registrationDate
        supplier.lastContactDate || new Date(), supplier.notes
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        country: row.country,
        postalCode: row.postal_code,
        category: row.category,
        status: row.status,
        rating: parseFloat(row.rating) || 0,
        contactPerson: row.contact_person,
        website: row.website,
        taxId: row.tax_id,
        registrationDate: row.registration_date,
        lastContactDate: row.last_contact_date,
        notes: row.notes
      };
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error('Failed to create supplier');
    }
  }

  // Update supplier
  static async updateSupplier(id: string, supplier: Partial<Supplier>, tenantId: string): Promise<Supplier> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      // Build dynamic update query
      Object.entries(supplier).forEach(([key, value]) => {
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
        UPDATE suppliers 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE tenant_id = $${paramCount} AND id = $${paramCount + 1}
        RETURNING *
      `, values);
      
      if (result.rows.length === 0) {
        throw new Error('Supplier not found');
      }
      
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        country: row.country,
        postalCode: row.postal_code,
        category: row.category,
        status: row.status,
        rating: parseFloat(row.rating) || 0,
        contactPerson: row.contact_person,
        website: row.website,
        taxId: row.tax_id,
        registrationDate: row.registration_date,
        lastContactDate: row.last_contact_date,
        notes: row.notes
      };
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error('Failed to update supplier');
    }
  }

  // Delete supplier
  static async deleteSupplier(id: string, tenantId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM suppliers WHERE id = $1 AND tenant_id = $2',
        [id, tenantId]
      );
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error('Failed to delete supplier');
    }
  }

  // Get suppliers by category
  static async getSuppliersByCategory(category: string, tenantId: string): Promise<Supplier[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM suppliers WHERE category = $1 AND tenant_id = $2 ORDER BY name',
        [category, tenantId]
      );
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        country: row.country,
        postalCode: row.postal_code,
        category: row.category,
        status: row.status,
        rating: parseFloat(row.rating) || 0,
        contactPerson: row.contact_person,
        website: row.website,
        taxId: row.tax_id,
        registrationDate: row.registration_date,
        lastContactDate: row.last_contact_date,
        notes: row.notes
      }));
    } catch (error) {
      console.error('Error fetching suppliers by category:', error);
      throw new Error('Failed to fetch suppliers by category');
    }
  }

  // Search suppliers
  static async searchSuppliers(searchTerm: string, tenantId: string): Promise<Supplier[]> {
    try {
      const result = await pool.query(`
        SELECT * FROM suppliers 
        WHERE tenant_id = $1 
        AND (name ILIKE $2 OR email ILIKE $2 OR contact_person ILIKE $2)
        ORDER BY name
      `, [tenantId, `%${searchTerm}%`]);
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        tenantId: row.tenant_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        country: row.country,
        postalCode: row.postal_code,
        category: row.category,
        status: row.status,
        rating: parseFloat(row.rating) || 0,
        contactPerson: row.contact_person,
        website: row.website,
        taxId: row.tax_id,
        registrationDate: row.registration_date,
        lastContactDate: row.last_contact_date,
        notes: row.notes
      }));
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw new Error('Failed to search suppliers');
    }
  }
}
