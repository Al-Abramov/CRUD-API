import dotenv from 'dotenv';
import { buildApp } from './app.js';

dotenv.config();

const app = buildApp();

const PORT = Number(process.env.PORT) || 4000;

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
