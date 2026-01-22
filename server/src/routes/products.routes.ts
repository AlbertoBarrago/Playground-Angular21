import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { products, calculateProductStatus, generateId, stockAdjustments } from '../data/products.js';
import type { 
  Product, 
  ProductSearchParams, 
  StockAdjustment, 
  StockAdjustmentInput,
  ApiResponse,
  JwtPayload
} from '../types/index.js';

/**
 * Product routes
 */
export async function productRoutes(fastify: FastifyInstance): Promise<void> {
  // Helper for auth
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    await fastify.authenticate(request, reply);
  };

  /**
   * GET /api/products
   * Search and filter products
   */
  fastify.get<{ Querystring: ProductSearchParams }>(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Products'],
        summary: 'Search and filter products',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            category: { type: 'string' },
            status: { type: 'string' },
            minStock: { type: 'number' },
            maxStock: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: { 
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: ProductSearchParams }>
    ): Promise<ApiResponse<Product[]>> => {
      const { query, category, status, minStock, maxStock } = request.query;

      let results = [...products];

      if (query) {
        const searchQuery = query.toLowerCase();
        results = results.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.sku.toLowerCase().includes(searchQuery) ||
            p.description.toLowerCase().includes(searchQuery)
        );
      }

      if (category) {
        results = results.filter((p) => p.category === category);
      }

      if (status) {
        results = results.filter((p) => p.status === status);
      }

      if (minStock !== undefined) {
        results = results.filter((p) => p.currentStock >= minStock);
      }

      if (maxStock !== undefined) {
        results = results.filter((p) => p.currentStock <= maxStock);
      }

      return {
        success: true,
        data: results,
      };
    }
  );

  /**
   * GET /api/products/:id
   * Get product by ID
   */
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Products'],
        summary: 'Get product by ID',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ): Promise<ApiResponse<Product>> => {
      const product = products.find((p) => p.id === request.params.id);

      if (!product) {
        reply.code(404);
        return {
          success: false,
          error: 'Product not found',
        };
      }

      return {
        success: true,
        data: product,
      };
    }
  );

  /**
   * GET /api/products/sku/:sku
   * Get product by SKU
   */
  fastify.get<{ Params: { sku: string } }>(
    '/sku/:sku',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Products'],
        summary: 'Get product by SKU',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['sku'],
          properties: {
            sku: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { sku: string } }>,
      reply: FastifyReply
    ): Promise<ApiResponse<Product>> => {
      const product = products.find(
        (p) => p.sku.toLowerCase() === request.params.sku.toLowerCase()
      );

      if (!product) {
        reply.code(404);
        return {
          success: false,
          error: 'Product not found',
        };
      }

      return {
        success: true,
        data: product,
      };
    }
  );

  /**
   * PATCH /api/products/:id/stock
   * Update product stock level
   */
  fastify.patch<{ 
    Params: { id: string }; 
    Body: StockAdjustmentInput 
  }>(
    '/:id/stock',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Stock'],
        summary: 'Update product stock level',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['newStock', 'adjustmentType', 'reason'],
          properties: {
            newStock: { type: 'number', minimum: 0 },
            adjustmentType: { 
              type: 'string',
              enum: ['increase', 'decrease', 'correction', 'transfer_in', 'transfer_out'],
            },
            reason: {
              type: 'string',
              enum: ['received_shipment', 'sold', 'damaged', 'lost', 'returned', 'inventory_count', 'transfer', 'other'],
            },
            notes: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: StockAdjustmentInput }>,
      reply: FastifyReply
    ): Promise<ApiResponse<StockAdjustment>> => {
      const productIndex = products.findIndex((p) => p.id === request.params.id);

      if (productIndex === -1) {
        reply.code(404);
        return {
          success: false,
          error: 'Product not found',
        };
      }

      const product = products[productIndex];
      const { newStock, adjustmentType, reason, notes } = request.body;

      const adjustment: StockAdjustment = {
        id: generateId(),
        productId: product.id,
        productSku: product.sku,
        productName: product.name,
        previousStock: product.currentStock,
        newStock,
        adjustmentType,
        reason,
        notes,
        adjustedBy: (request.user as JwtPayload)?.email || 'unknown',
        adjustedAt: new Date(),
      };

      // Update product
      product.currentStock = newStock;
      product.status = calculateProductStatus(product);
      product.updatedAt = new Date();

      // Store adjustment in history
      stockAdjustments.push(adjustment);

      return {
        success: true,
        data: adjustment,
      };
    }
  );

  /**
   * GET /api/products/:id/adjustments
   * Get stock adjustment history for a product
   */
  fastify.get<{ Params: { id: string } }>(
    '/:id/adjustments',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Stock'],
        summary: 'Get stock adjustment history',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: { type: 'object' },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string } }>
    ): Promise<ApiResponse<StockAdjustment[]>> => {
      const productAdjustments = stockAdjustments.filter(
        (a) => a.productId === request.params.id
      );

      return {
        success: true,
        data: productAdjustments.sort(
          (a, b) => b.adjustedAt.getTime() - a.adjustedAt.getTime()
        ),
      };
    }
  );
}
