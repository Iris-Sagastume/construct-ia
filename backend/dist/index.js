"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const db = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Middleware: exige x-tenant-id
app.use((req, res, next) => {
    const tenantId = req.header('x-tenant-id');
    if (!tenantId)
        return res.status(400).json({ error: 'Missing x-tenant-id' });
    req.tenantId = tenantId;
    next();
});
app.get('/health', (_req, res) => {
    res.json({ ok: true, ts: Date.now(), service: 'construct-ia-api' });
});
app.get('/projects', async (req, res) => {
    const tenantId = req.tenantId;
    const data = await db.project.findMany({ where: { companyId: tenantId } });
    res.json(data);
});
app.post('/projects', async (req, res) => {
    const tenantId = req.tenantId;
    const { name } = req.body;
    if (!name)
        return res.status(400).json({ error: 'name is required' });
    const p = await db.project.create({
        data: { name, status: 'PLANIFICACION', companyId: tenantId }
    });
    res.status(201).json(p);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
//# sourceMappingURL=index.js.map