import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const app = express();
const db = new PrismaClient();

app.use(cors());
app.use(express.json());

// Middleware: exige x-tenant-id
app.use((req, res, next) => {
  const tenantId = req.header('x-tenant-id');
  if (!tenantId) return res.status(400).json({ error: 'Missing x-tenant-id' });
  (req as any).tenantId = tenantId;
  next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now(), service: 'construct-ia-api' });
});

app.get('/projects', async (req, res) => {
  const tenantId = (req as any).tenantId as string;
  const data = await db.project.findMany({ where: { companyId: tenantId } });
  res.json(data);
});

app.post('/projects', async (req, res) => {
  const tenantId = (req as any).tenantId as string;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const p = await db.project.create({
    data: { name, status: 'PLANIFICACION', companyId: tenantId }
  });
  res.status(201).json(p);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
