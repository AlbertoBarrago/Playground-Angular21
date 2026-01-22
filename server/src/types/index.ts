/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  password: string; // In production, this would be hashed
  name: string;
  role: 'admin' | 'manager' | 'operator';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User without password for API responses
 */
export type SafeUser = Omit<User, 'password'>;

/**
 * JWT payload
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: User['role'];
}

/**
 * Login request body
 */
export interface LoginBody {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: SafeUser;
  token: string;
}

/**
 * Product entity in the warehouse
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: StockUnit;
  location: WarehouseLocation;
  price: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stock adjustment record
 */
export interface StockAdjustment {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  previousStock: number;
  newStock: number;
  adjustmentType: AdjustmentType;
  reason: AdjustmentReason;
  notes?: string;
  adjustedBy: string;
  adjustedAt: Date;
}

/**
 * Form data for creating a stock adjustment
 */
export interface StockAdjustmentInput {
  newStock: number;
  adjustmentType: AdjustmentType;
  reason: AdjustmentReason;
  notes?: string;
}

/**
 * Product categories
 */
export type ProductCategory =
  | 'electronics'
  | 'furniture'
  | 'clothing'
  | 'food'
  | 'tools'
  | 'packaging'
  | 'other';

/**
 * Stock measurement units
 */
export type StockUnit = 'pieces' | 'boxes' | 'pallets' | 'kg' | 'liters';

/**
 * Product availability status
 */
export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';

/**
 * Type of stock adjustment
 */
export type AdjustmentType =
  | 'increase'
  | 'decrease'
  | 'correction'
  | 'transfer_in'
  | 'transfer_out';

/**
 * Reason for stock adjustment
 */
export type AdjustmentReason =
  | 'received_shipment'
  | 'sold'
  | 'damaged'
  | 'lost'
  | 'returned'
  | 'inventory_count'
  | 'transfer'
  | 'other';

/**
 * Warehouse location
 */
export interface WarehouseLocation {
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
}

/**
 * Search/filter parameters for products
 */
export interface ProductSearchParams {
  query?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  minStock?: number;
  maxStock?: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Extend FastifyJWT for proper typing
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}
