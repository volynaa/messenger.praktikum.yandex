import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

const spaRoutes = [
    '/',
    '/messenger',
    '/settings',
    '/settings/data',
    '/settings/password',
    '/sign-up',
    '/404',
    '/500',
];

spaRoutes.forEach(route => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
