import Fastify from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

const app = Fastify();

const PORT = Number(process.env.PORT) || 4000;

app.get('/', async (request, reply) => {
  return { message: 'API is running' };
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
