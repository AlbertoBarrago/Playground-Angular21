import type { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';

/**
 * Helmet plugin for security headers
 */
export async function helmetPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
  });
}
