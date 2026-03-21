import cluster from 'node:cluster';
import os from 'node:os';
import http from 'node:http';
const numCPU = os.availableParallelism();
const workersCount = numCPU - 1;
const PORT = Number(process.env.PORT) || 4000;
const workers = [];
let currentWorker = 0;
const server = http.createServer((req, resp) => {
    const targetWorker = workers[currentWorker % workers.length];
    currentWorker++;
    const targetPort = targetWorker.port;
    const proxyReq = http.request({
        hostname: 'localhost',
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
    }, (res) => {
        resp.writeHead(res.statusCode || 500, res.headers);
        res.pipe(resp);
    });
    proxyReq.on('error', () => {
        resp.statusCode = 500;
        resp.end('Worker error');
    });
    req.pipe(proxyReq);
});
if (cluster.isPrimary) {
    const products = [];
    for (let i = 0; i < workersCount; i++) {
        const workerPort = PORT + i + 1;
        const worker = cluster.fork({ PORT: String(workerPort) });
        workers.push({ port: workerPort, worker });
    }
    workers.forEach(({ worker }) => {
        worker.on('message', (msg) => {
            if (msg.type === 'GET_ALL') {
                worker.send({
                    type: 'GET_ALL_RESULT',
                    data: products,
                    requestId: msg.requestId,
                });
            }
            if (msg.type === 'CREATE') {
                const newProduct = msg.payload;
                products.push(newProduct);
                worker.send({
                    type: 'CREATE_RESULT',
                    data: newProduct,
                    requestId: msg.requestId,
                });
            }
            if (msg.type === 'GET_ID') {
                const product = products.find(({ id }) => id === msg.payload);
                worker.send({
                    type: 'GET_ID_RESULT',
                    data: product,
                    requestId: msg.requestId,
                });
            }
            if (msg.type === 'UPDATE') {
                const { productId, data } = msg.payload;
                const index = products.findIndex(({ id }) => id === productId);
                const isProduct = index >= 0;
                let updatedProduct = null;
                if (isProduct) {
                    const product = products[index];
                    updatedProduct = {
                        ...product,
                        ...data,
                    };
                    products[index] = updatedProduct;
                }
                worker.send({
                    type: 'UPDATE_RESULT',
                    requestId: msg.requestId,
                    data: updatedProduct,
                });
            }
            if (msg.type === 'DELETE') {
                const { productId } = msg.payload;
                const index = products.findIndex(({ id }) => id === productId);
                const isProduct = index >= 0;
                if (isProduct) {
                    products.splice(index, 1);
                }
                worker.send({
                    type: 'DELETE_RESULT',
                    requestId: msg.requestId,
                    data: isProduct,
                });
            }
        });
    });
    server.listen(PORT, () => {
        console.log(`Load balancer running on ${PORT}`);
    });
}
else {
    import('../server.js');
}
