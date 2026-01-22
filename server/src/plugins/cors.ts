import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

/**
 * CORS plugin configuration
 * Allows cross-origin requests from the Angular frontend
 */
export async function corsPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });
}
