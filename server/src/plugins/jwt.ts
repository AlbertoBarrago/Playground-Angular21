import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { JwtPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'warehouse-secret-key-change-in-production';

/**
 * JWT plugin configuration
 */
async function jwtPluginAsync(fastify: FastifyInstance): Promise<void> {
  await fastify.register(jwt, {
    secret: JWT_SECRET,
    sign: {
      expiresIn: '8h',
    },
  });

  // Decorate with authentication method
  fastify.decorate('authenticate', async function (
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ 
        success: false, 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
      });
    }
  });
}

// Use fastify-plugin to break encapsulation and make jwt available globally
export const jwtPlugin = fp(jwtPluginAsync, { name: 'jwt-plugin' });

// Helper to get typed user from request
export function getUser(request: FastifyRequest): JwtPayload {
  return request.user as JwtPayload;
}

// Extend FastifyInstance to include authenticate
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
