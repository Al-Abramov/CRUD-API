import { FastifyInstance, FastifyRequest } from 'fastify';
import { products } from '../db/products.js';
import { createProductSchema } from '../schemas/product.schema.js';
import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import { validate as isUuid } from 'uuid';
import { ProductIdParams } from '../types/product.js';

export const productRoutes = async (app: FastifyInstance) => {
  app.get('/api/products', async () => {
    return products;
  });

  app.post('/api/products', async (request: FastifyRequest, reply) => {
    try {
      const validBody = createProductSchema.parse(request.body);

      const newProduct = {
        id: randomUUID(),
        ...validBody,
      };

      products.push(newProduct);

      return reply.status(201).send(newProduct);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: 'Validation error',
          issues: error.issues,
        });
      }
      return reply.status(500).send({
        message: 'Internal server error',
      });
    }
  });

  app.get<{ Params: ProductIdParams }>('/api/products/:productId', async (request, reply) => {
    const { productId } = request.params;

    if (!isUuid(productId)) {
      return reply.status(400).send({
        message: 'Invalid productId',
      });
    }

    const product = products.find(({ id }) => id === productId);

    if (!product) {
      return reply.status(404).send({
        message: `Product not found`,
      });
    }

    return reply.status(200).send(product);
  });

  app.put<{ Params: ProductIdParams }>('/api/products/:productId', async (request, reply) => {
    const { productId } = request.params;

    if (!isUuid(productId)) {
      return reply.status(400).send({
        message: 'Invalid productId',
      });
    }

    const index = products.findIndex(({ id }) => id === productId);

    if (index < 0) {
      return reply.status(404).send({
        message: `Product not found`,
      });
    }

    try {
      const validBody = createProductSchema.parse(request.body);
      const product = products[index];

      const updatedProduct = {
        ...product,
        ...validBody,
      };

      products[index] = updatedProduct;

      return reply.status(200).send(updatedProduct);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: 'Validation error',
          issues: error.issues,
        });
      }
      return reply.status(500).send({
        message: 'Internal server error',
      });
    }
  });

  app.delete<{ Params: ProductIdParams }>('/api/products/:productId', async (request, reply) => {
    const { productId } = request.params;

    if (!isUuid(productId)) {
      return reply.status(400).send({
        message: 'Invalid productId',
      });
    }

    const index = products.findIndex(({ id }) => id === productId);

    if (index < 0) {
      return reply.status(404).send({
        message: `Product not found`,
      });
    }

    products.splice(index, 1);

    return reply.status(204).send();
  });
};
