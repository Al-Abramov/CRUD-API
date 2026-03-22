import { Worker } from 'node:cluster';
import { Product } from './product.js';

export interface IWorker {
  worker: Worker;
  port: number;
}

export type WorkerMessage = {
  type: string;
  data?: Product;
  requestId: string;
};
