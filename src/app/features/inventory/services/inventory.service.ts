import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { 
  Product, 
  StockAdjustment, 
  StockAdjustmentFormData,
  ProductSearchParams 
} from '../models/inventory.models';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Inventory service for product and stock management
 * Connects to the Fastify API server
 */
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly api = inject(ApiService);

  /**
   * Search products with optional filters
   */
  searchProducts(params: ProductSearchParams): Observable<Product[]> {
    const queryParams: Record<string, string | number> = {};
    
    if (params.query) queryParams['query'] = params.query;
    if (params.category) queryParams['category'] = params.category;
    if (params.status) queryParams['status'] = params.status;
    if (params.minStock !== undefined) queryParams['minStock'] = params.minStock;
    if (params.maxStock !== undefined) queryParams['maxStock'] = params.maxStock;

    return this.api.get<ApiResponse<Product[]>>('products', queryParams).pipe(
      map(response => response.data ?? [])
    );
  }

  /**
   * Get a single product by ID
   */
  getProductById(id: string): Observable<Product | null> {
    return this.api.get<ApiResponse<Product>>(`products/${id}`).pipe(
      map(response => response.data ?? null)
    );
  }

  /**
   * Get a product by SKU
   */
  getProductBySku(sku: string): Observable<Product | null> {
    return this.api.get<ApiResponse<Product>>(`products/sku/${sku}`).pipe(
      map(response => response.data ?? null)
    );
  }

  /**
   * Update product stock level
   */
  updateStock(
    productId: string, 
    formData: StockAdjustmentFormData
  ): Observable<StockAdjustment> {
    const body = {
      newStock: formData.newStock,
      adjustmentType: formData.adjustmentType,
      reason: formData.reason,
      notes: formData.notes,
    };

    return this.api.patch<ApiResponse<StockAdjustment>>(`products/${productId}/stock`, body).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to update stock');
        }
        return response.data;
      })
    );
  }

  /**
   * Get recent stock adjustments for a product
   */
  getAdjustmentHistory(productId: string): Observable<StockAdjustment[]> {
    return this.api.get<ApiResponse<StockAdjustment[]>>(`products/${productId}/adjustments`).pipe(
      map(response => response.data ?? [])
    );
  }
}
