import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { validateCredentials, sanitizeUser, findUserById } from '../data/users.js';
import type { LoginBody, LoginResponse, ApiResponse, SafeUser, JwtPayload } from '../types/index.js';

/**
 * Authentication routes
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/auth/login
   * Authenticate user and return JWT token
   */
  fastify.post<{ Body: LoginBody }>(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      name: { type: 'string' },
                      role: { type: 'string' },
                    },
                  },
                  token: { type: 'string' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: LoginBody }>,
      reply: FastifyReply
    ): Promise<ApiResponse<LoginResponse>> => {
      const { email, password } = request.body;

      const user = validateCredentials(email, password);

      if (!user) {
        reply.code(401);
        return {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid email or password',
        };
      }

      const safeUser = sanitizeUser(user);
      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        success: true,
        data: {
          user: safeUser,
          token,
        },
      };
    }
  );

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal)
   */
  fastify.post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Logout current user',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (): Promise<ApiResponse<null>> => {
      // In a stateless JWT setup, logout is handled client-side
      // If using refresh tokens, we would invalidate them here
      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  );

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  fastify.get(
    '/me',
    {
      preHandler: [async (request, reply) => await fastify.authenticate(request, reply)],
      schema: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<ApiResponse<SafeUser>> => {
      const jwtUser = request.user as JwtPayload;
      const userId = jwtUser?.userId;

      if (!userId) {
        reply.code(401);
        return {
          success: false,
          error: 'Unauthorized',
        };
      }

      const user = findUserById(userId);

      if (!user) {
        reply.code(404);
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        data: sanitizeUser(user),
      };
    }
  );

  /**
   * POST /api/auth/refresh
   * Refresh JWT token
   */
  fastify.post(
    '/refresh',
    {
      preHandler: [async (request, reply) => await fastify.authenticate(request, reply)],
      schema: {
        tags: ['Auth'],
        summary: 'Refresh JWT token',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest
    ): Promise<ApiResponse<{ token: string }>> => {
      const jwtUser = request.user as JwtPayload;
      const { userId, email, role } = jwtUser;

      const newToken = fastify.jwt.sign({ userId, email, role });

      return {
        success: true,
        data: { token: newToken },
      };
    }
  );
}
