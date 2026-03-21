import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';
import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import { validate as isUuid } from 'uuid';
export const productRoutes = async (app) => {
    app.get('/api/products', async () => {
        return new Promise((resolve) => {
            const requestId = randomUUID();
            const handler = (msg) => {
                if (msg.requestId === requestId && msg.type === 'GET_ALL_RESULT') {
                    process.off('message', handler);
                    resolve(msg.data);
                }
            };
            process.on('message', handler);
            process.send?.({ type: 'GET_ALL', requestId });
        });
    });
    app.post('/api/products', async (request, reply) => {
        try {
            const requestId = randomUUID();
            const validBody = createProductSchema.parse(request.body);
            const newProduct = {
                id: randomUUID(),
                ...validBody,
            };
            const createdProduct = await new Promise((resolve) => {
                const handler = (msg) => {
                    if (msg.requestId === requestId && msg.type === 'CREATE_RESULT') {
                        process.off('message', handler);
                        resolve(msg.data);
                    }
                };
                process.on('message', handler);
                process.send?.({ type: 'CREATE', payload: newProduct, requestId });
            });
            // products.push(newProduct);
            return reply.status(201).send(createdProduct);
        }
        catch (error) {
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
    app.get('/api/products/:productId', async (request, reply) => {
        const { productId } = request.params;
        if (!isUuid(productId)) {
            return reply.status(400).send({
                message: 'Invalid productId',
            });
        }
        // const product = products.find(({ id }) => id === productId);
        const product = await new Promise((resolve) => {
            const requestId = randomUUID();
            const handler = (msg) => {
                if (msg.requestId === requestId && msg.type === 'GET_ID_RESULT') {
                    process.off('message', handler);
                    resolve(msg.data);
                }
            };
            process.on('message', handler);
            process.send?.({ type: 'GET_ID', payload: productId, requestId });
        });
        if (!product) {
            return reply.status(404).send({
                message: `Product not found`,
            });
        }
        return reply.status(200).send(product);
    });
    app.put('/api/products/:productId', async (request, reply) => {
        const { productId } = request.params;
        if (!isUuid(productId)) {
            return reply.status(400).send({
                message: 'Invalid productId',
            });
        }
        // const index = products.findIndex(({ id }) => id === productId);
        // if (index < 0) {
        //   return reply.status(404).send({
        //     message: `Product not found`,
        //   });
        // }
        try {
            const validBody = updateProductSchema.parse(request.body);
            // const product = products[index];
            // const updatedProduct = {
            //   ...product,
            //   ...validBody,
            // };
            const updatedProduct = await new Promise((resolve) => {
                const requestId = randomUUID();
                const handler = (msg) => {
                    if (msg.requestId === requestId && msg.type === 'UPDATE_RESULT') {
                        process.off('message', handler);
                        resolve(msg.data);
                    }
                };
                process.on('message', handler);
                process.send?.({
                    type: 'UPDATE',
                    requestId,
                    payload: { productId, data: validBody },
                });
            });
            if (!updatedProduct) {
                return reply.status(404).send({
                    message: `Product not found`,
                });
            }
            // products[index] = updatedProduct;
            return reply.status(200).send(updatedProduct);
        }
        catch (error) {
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
    app.delete('/api/products/:productId', async (request, reply) => {
        const { productId } = request.params;
        if (!isUuid(productId)) {
            return reply.status(400).send({
                message: 'Invalid productId',
            });
        }
        // const index = products.findIndex(({ id }) => id === productId);
        // if (index < 0) {
        //   return reply.status(404).send({
        //     message: `Product not found`,
        //   });
        // }
        // products.splice(index, 1);
        const result = await new Promise((resolve) => {
            const requestId = randomUUID();
            const handler = (msg) => {
                if (msg.requestId === requestId && msg.type === 'DELETE_RESULT') {
                    process.off('message', handler);
                    resolve(msg.data);
                }
            };
            process.on('message', handler);
            process.send?.({
                type: 'DELETE',
                requestId,
                payload: { productId },
            });
        });
        if (!result) {
            return reply.status(404).send({
                message: `Product not found`,
            });
        }
        return reply.status(204).send();
    });
};
