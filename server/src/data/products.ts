import type { Product, StockAdjustment } from '../types/index.js';

/**
 * In-memory product database
 * In production, this would be replaced with a real database
 */
export const products: Product[] = [
  {
    id: '1',
    sku: 'ELEC-001',
    name: 'Wireless Keyboard',
    description: 'Ergonomic wireless keyboard with backlit keys',
    category: 'electronics',
    currentStock: 150,
    minStock: 20,
    maxStock: 500,
    unit: 'pieces',
    location: { zone: 'A', aisle: '01', rack: 'R1', shelf: 'S3' },
    price: 49.99,
    status: 'in_stock',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-10'),
  },
  {
    id: '2',
    sku: 'ELEC-002',
    name: 'USB-C Hub 7-in-1',
    description: 'Multi-port USB-C hub with HDMI and card reader',
    category: 'electronics',
    currentStock: 8,
    minStock: 15,
    maxStock: 200,
    unit: 'pieces',
    location: { zone: 'A', aisle: '01', rack: 'R2', shelf: 'S1' },
    price: 39.99,
    status: 'low_stock',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-06-12'),
  },
  {
    id: '3',
    sku: 'FURN-001',
    name: 'Standing Desk Frame',
    description: 'Electric height-adjustable desk frame',
    category: 'furniture',
    currentStock: 0,
    minStock: 5,
    maxStock: 50,
    unit: 'pieces',
    location: { zone: 'B', aisle: '03', rack: 'R1', shelf: 'S1' },
    price: 299.99,
    status: 'out_of_stock',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-06-08'),
  },
  {
    id: '4',
    sku: 'PACK-001',
    name: 'Cardboard Boxes (Medium)',
    description: '12x12x12 inch shipping boxes',
    category: 'packaging',
    currentStock: 2500,
    minStock: 500,
    maxStock: 5000,
    unit: 'pieces',
    location: { zone: 'C', aisle: '01', rack: 'R1', shelf: 'S1' },
    price: 1.25,
    status: 'in_stock',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-15'),
  },
  {
    id: '5',
    sku: 'TOOL-001',
    name: 'Cordless Drill Set',
    description: '20V cordless drill with battery and case',
    category: 'tools',
    currentStock: 45,
    minStock: 10,
    maxStock: 100,
    unit: 'pieces',
    location: { zone: 'D', aisle: '02', rack: 'R3', shelf: 'S2' },
    price: 129.99,
    status: 'in_stock',
    createdAt: new Date('2024-04-10'),
    updatedAt: new Date('2024-06-14'),
  },
  {
    id: '6',
    sku: 'ELEC-003',
    name: 'Bluetooth Mouse',
    description: 'Ergonomic vertical mouse with adjustable DPI',
    category: 'electronics',
    currentStock: 78,
    minStock: 25,
    maxStock: 300,
    unit: 'pieces',
    location: { zone: 'A', aisle: '01', rack: 'R1', shelf: 'S4' },
    price: 34.99,
    status: 'in_stock',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-06-11'),
  },
];

/**
 * In-memory stock adjustments history
 */
export const stockAdjustments: StockAdjustment[] = [];

/**
 * Calculate product status based on stock levels
 */
export function calculateProductStatus(product: Product): Product['status'] {
  if (product.currentStock === 0) return 'out_of_stock';
  if (product.currentStock <= product.minStock) return 'low_stock';
  return 'in_stock';
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}
