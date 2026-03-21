import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../app.js';
import { products } from '../db/products.js';
describe('Products API', () => {
    let app;
    beforeEach(() => {
        app = buildApp();
        products.length = 0;
    });
    it('should perform full CRUD flow', async () => {
        // get all
        const allProductsResp = await app.inject({
            method: 'GET',
            url: '/api/products',
        });
        expect(allProductsResp.statusCode).toBe(200);
        expect(JSON.parse(allProductsResp.body)).toEqual([]);
        // post
        const newProductResp = await app.inject({
            method: 'POST',
            url: '/api/products',
            payload: {
                name: 'Laptop',
                description: 'laptop',
                price: 10000,
                category: 'electronics',
                inStock: true,
            },
        });
        expect(newProductResp.statusCode).toBe(201);
        const newProduct = JSON.parse(newProductResp.body);
        const createdProductId = newProduct.id;
        expect(newProduct.id).toBeDefined();
        expect(newProduct.name).toBe('Laptop');
        expect(newProduct.price).toBe(10000);
        // get by id
        const productByIdResp = await app.inject({
            method: 'GET',
            url: `/api/products/${createdProductId}`,
        });
        const productById = JSON.parse(productByIdResp.body);
        expect(productByIdResp.statusCode).toBe(200);
        expect(productById.id).toBe(createdProductId);
        // put
        const updatedProductResp = await app.inject({
            method: 'PUT',
            url: `/api/products/${createdProductId}`,
            payload: {
                name: 'Laptop new',
                description: 'laptop',
                price: 15000,
                category: 'electronics',
                inStock: true,
            },
        });
        expect(updatedProductResp.statusCode).toBe(200);
        const updatedProduct = JSON.parse(updatedProductResp.body);
        expect(updatedProduct.id).toBe(createdProductId);
        expect(updatedProduct.name).toBe('Laptop new');
        expect(updatedProduct.price).toBe(15000);
        // delete
        const deletedResp = await app.inject({
            method: 'DELETE',
            url: `/api/products/${createdProductId}`,
        });
        expect(deletedResp.statusCode).toBe(204);
        // check delete
        const getAfterDelete = await app.inject({
            method: 'GET',
            url: `/api/products/${createdProductId}`,
        });
        expect(getAfterDelete.statusCode).toBe(404);
    });
    it('should return 404 if non-existing endpoints', async () => {
        const allProductsResp = await app.inject({
            method: 'GET',
            url: '/api/production',
        });
        expect(allProductsResp.statusCode).toBe(404);
    });
    it('should return 400 for invalid UUID', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/products/invalid-id',
        });
        expect(response.statusCode).toBe(400);
    });
    it('should return 400 for invalid product data', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/products',
            payload: {
                name: 'Laptop',
                price: -100,
            },
        });
        expect(response.statusCode).toBe(400);
    });
});
