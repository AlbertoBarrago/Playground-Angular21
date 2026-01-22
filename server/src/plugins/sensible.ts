import type { FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';

/**
 * Sensible plugin adds useful utilities like httpErrors
 */
export async function sensiblePlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(sensible);
}
