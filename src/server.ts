import Fastify from 'fastify';
import dotenv from 'dotenv';
import { productRoutes } from './routes/products.js';

dotenv.config();

const app = Fastify();

const PORT = Number(process.env.PORT) || 4000;

app.register(productRoutes);

app.setErrorHandler((error, request, reply) => {
  app.log.error(error);

  return reply.status(500).send({
    message: 'Internal server error',
  });
});

app.setNotFoundHandler((request, reply) => {
  return reply.status(404).send({
    message: 'Route not found',
  });
});

const start = async () => {
  try {
    await app.listen({ port: PORT });
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
