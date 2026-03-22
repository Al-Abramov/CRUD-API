import Fastify from 'fastify';
import { productRoutes } from './routes/products.js';

export const buildApp = () => {
  const app = Fastify();

  app.register(productRoutes);

  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      message: 'Route not found',
    });
  });

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    return reply.status(500).send({
      message: 'Internal server error',
    });
  });

  return app;
};
