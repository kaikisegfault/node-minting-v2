/**
 * Local Express wrapper for testing the Lambda handler locally.
 * Simulates API Gateway -> Lambda invocation.
 *
 * Usage: node local-server.mjs
 * Then POST to http://localhost:3001 with the same body as API Gateway.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// Override AWS config for local development
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const { handler } = await import('./index.mjs');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
    try {
        const event = {
            body: JSON.stringify(req.body),
            headers: req.headers,
            httpMethod: 'POST'
        };

        const result = await handler(event);

        res.status(result.statusCode)
           .set(result.headers)
           .json(JSON.parse(result.body));
    } catch (error) {
        console.error('Local server error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.options('/', (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }).status(200).end();
});

const PORT = process.env.LAMBDA_LOCAL_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Lambda local server running at http://localhost:${PORT}`);
    console.log('POST requests will be forwarded to the Lambda handler');
});
