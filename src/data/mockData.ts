import { Supplier, Product, Order, DashboardStats } from '../types';

export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    tenantId: 'tenant_company1', // Ajout du tenantId
    name: 'Tech Solutions Inc.',
    email: 'contact@techsolutions.com',
    phone: '+1-555-0123',
    address: '123 Tech Street',
    city: 'San Francisco',
    country: 'USA',
    postalCode: '94105',
    category: 'Technology',
    status: 'active',
    rating: 4.5,
    contactPerson: 'John Smith',
    website: 'https://techsolutions.com',
    taxId: 'TAX123456',
    registrationDate: new Date('2023-01-15'),
    lastContactDate: new Date('2024-01-20'),
    notes: 'Reliable technology supplier with excellent service.'
  },
  {
    id: '2',
    tenantId: 'tenant_company1', // Ajout du tenantId
    name: 'Global Manufacturing Co.',
    email: 'info@globalmfg.com',
    phone: '+1-555-0456',
    address: '456 Industrial Ave',
    city: 'Chicago',
    country: 'USA',
    postalCode: '60601',
    category: 'Manufacturing',
    status: 'active',
    rating: 4.2,
    contactPerson: 'Sarah Johnson',
    website: 'https://globalmfg.com',
    taxId: 'TAX789012',
    registrationDate: new Date('2023-03-10'),
    lastContactDate: new Date('2024-01-18'),
    notes: 'Large scale manufacturing capabilities.'
  },
  {
    id: '3',
    tenantId: 'tenant_company2', // Ajout du tenantId
    name: 'Quality Parts Ltd.',
    email: 'sales@qualityparts.com',
    phone: '+1-555-0789',
    address: '789 Quality Road',
    city: 'Detroit',
    country: 'USA',
    postalCode: '48201',
    category: 'Automotive',
    status: 'active',
    rating: 4.8,
    contactPerson: 'Mike Wilson',
    website: 'https://qualityparts.com',
    taxId: 'TAX345678',
    registrationDate: new Date('2023-02-20'),
    lastContactDate: new Date('2024-01-22'),
    notes: 'Premium automotive parts supplier.'
  },
  {
    id: '4',
    tenantId: 'tenant_enterprise', // Ajout du tenantId
    name: 'Eco Materials Corp.',
    email: 'hello@ecomaterials.com',
    phone: '+1-555-0321',
    address: '321 Green Street',
    city: 'Portland',
    country: 'USA',
    postalCode: '97201',
    category: 'Materials',
    status: 'pending',
    rating: 0,
    contactPerson: 'Lisa Brown',
    website: 'https://ecomaterials.com',
    registrationDate: new Date('2024-01-15'),
    notes: 'New supplier specializing in eco-friendly materials.'
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    tenantId: 'tenant_company1', // Ajout du tenantId
    name: 'Laptop Computer',
    description: 'High-performance business laptop',
    category: 'Technology',
    unit: 'piece',
    price: 1200.00,
    currency: 'XOF',
    supplierId: '1',
    supplierName: 'Tech Solutions Inc.',
    stockQuantity: 25,
    minStockLevel: 10,
    status: 'available',
    createdAt: new Date('2023-02-15')
  },
  {
    id: '2',
    tenantId: 'tenant_company1', // Ajout du tenantId
    name: 'Steel Sheets',
    description: 'Industrial grade steel sheets',
    category: 'Manufacturing',
    unit: 'ton',
    price: 850.00,
    currency: 'NGN',
    supplierId: '2',
    supplierName: 'Global Manufacturing Co.',
    stockQuantity: 150,
    minStockLevel: 50,
    status: 'available',
    createdAt: new Date('2023-03-20')
  },
  {
    id: '3',
    tenantId: 'tenant_company2', // Ajout du tenantId
    name: 'Brake Pads',
    description: 'Premium automotive brake pads',
    category: 'Automotive',
    unit: 'set',
    price: 45.00,
    currency: 'GHS',
    supplierId: '3',
    supplierName: 'Quality Parts Ltd.',
    stockQuantity: 200,
    minStockLevel: 75,
    status: 'available',
    createdAt: new Date('2023-02-10')
  },
  {
    id: '4',
    tenantId: 'tenant_enterprise', // Ajout du tenantId
    name: 'Recycled Plastic',
    description: 'Eco-friendly recycled plastic material',
    category: 'Materials',
    unit: 'kg',
    price: 2.50,
    currency: 'KES',
    supplierId: '4',
    supplierName: 'Eco Materials Corp.',
    stockQuantity: 1000,
    minStockLevel: 200,
    status: 'available',
    createdAt: new Date('2024-01-15')
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    tenantId: 'tenant_company1', // Ajout du tenantId
    orderNumber: 'ORD-2024-001',
    supplierId: '1',
    supplierName: 'Tech Solutions Inc.',
    orderDate: new Date('2024-01-15'),
    expectedDeliveryDate: new Date('2024-01-25'),
    actualDeliveryDate: new Date('2024-01-23'),
    status: 'delivered',
    totalAmount: 2400.00,
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Laptop Computer',
        quantity: 2,
        unitPrice: 1200.00,
        totalPrice: 2400.00
      }
    ],
    notes: 'Priority order for new office setup.'
  },
  {
    id: '2',
    tenantId: 'tenant_company1', // Ajout du tenantId
    orderNumber: 'ORD-2024-002',
    supplierId: '2',
    supplierName: 'Global Manufacturing Co.',
    orderDate: new Date('2024-01-18'),
    expectedDeliveryDate: new Date('2024-02-01'),
    status: 'shipped',
    totalAmount: 1700.00,
    items: [
      {
        id: '2',
        productId: '2',
        productName: 'Steel Sheets',
        quantity: 2,
        unitPrice: 850.00,
        totalPrice: 1700.00
      }
    ]
  },
  {
    id: '3',
    tenantId: 'tenant_company2', // Ajout du tenantId
    orderNumber: 'ORD-2024-003',
    supplierId: '3',
    supplierName: 'Quality Parts Ltd.',
    orderDate: new Date('2024-01-20'),
    expectedDeliveryDate: new Date('2024-01-30'),
    status: 'pending',
    totalAmount: 1350.00,
    items: [
      {
        id: '3',
        productId: '3',
        productName: 'Brake Pads',
        quantity: 30,
        unitPrice: 45.00,
        totalPrice: 1350.00
      }
    ],
    notes: 'Regular maintenance order for fleet vehicles.'
  },
  {
    id: '4',
    tenantId: 'tenant_company1', // Ajout du tenantId
    orderNumber: 'ORD-2024-004',
    supplierId: '1',
    supplierName: 'Tech Solutions Inc.',
    orderDate: new Date('2024-01-22'),
    expectedDeliveryDate: new Date('2024-02-05'),
    status: 'confirmed',
    totalAmount: 3600.00,
    items: [
      {
        id: '4',
        productId: '1',
        productName: 'Laptop Computer',
        quantity: 3,
        unitPrice: 1200.00,
        totalPrice: 3600.00
      }
    ]
  },
  {
    id: '5',
    tenantId: 'tenant_enterprise', // Ajout du tenantId
    orderNumber: 'ORD-2024-005',
    supplierId: '4',
    supplierName: 'Eco Materials Corp.',
    orderDate: new Date('2024-01-25'),
    expectedDeliveryDate: new Date('2024-02-10'),
    status: 'pending',
    totalAmount: 5000.00,
    items: [
      {
        id: '5',
        productId: '4',
        productName: 'Recycled Plastic',
        quantity: 2000,
        unitPrice: 2.50,
        totalPrice: 5000.00
      }
    ],
    notes: 'Bulk order for sustainable packaging project.'
  },
  {
    id: '6',
    tenantId: 'tenant_company1', // Ajout du tenantId
    orderNumber: 'ORD-2024-006',
    supplierId: '2',
    supplierName: 'Global Manufacturing Co.',
    orderDate: new Date('2024-01-28'),
    expectedDeliveryDate: new Date('2024-02-15'),
    status: 'cancelled',
    totalAmount: 2550.00,
    items: [
      {
        id: '6',
        productId: '2',
        productName: 'Steel Sheets',
        quantity: 3,
        unitPrice: 850.00,
        totalPrice: 2550.00
      }
    ],
    notes: 'Cancelled due to project delay.'
  },
  {
    id: '7',
    tenantId: 'tenant_company2', // Ajout du tenantId
    orderNumber: 'ORD-2024-007',
    supplierId: '3',
    supplierName: 'Quality Parts Ltd.',
    orderDate: new Date('2024-01-30'),
    expectedDeliveryDate: new Date('2024-02-08'),
    status: 'shipped',
    totalAmount: 900.00,
    items: [
      {
        id: '7',
        productId: '3',
        productName: 'Brake Pads',
        quantity: 20,
        unitPrice: 45.00,
        totalPrice: 900.00
      }
    ]
  },
  {
    id: '8',
    tenantId: 'tenant_company1', // Ajout du tenantId
    orderNumber: 'ORD-2024-008',
    supplierId: '1',
    supplierName: 'Tech Solutions Inc.',
    orderDate: new Date('2024-02-01'),
    expectedDeliveryDate: new Date('2024-02-12'),
    status: 'confirmed',
    totalAmount: 1200.00,
    items: [
      {
        id: '8',
        productId: '1',
        productName: 'Laptop Computer',
        quantity: 1,
        unitPrice: 1200.00,
        totalPrice: 1200.00
      }
    ],
    notes: 'Replacement for damaged unit.'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalSuppliers: 4,
  activeSuppliers: 3,
  totalOrders: 8,
  pendingOrders: 2,
  totalProducts: 4,
  lowStockProducts: 1,
  monthlySpending: 18750.00,
  topSuppliers: mockSuppliers.slice(0, 3)
}; 