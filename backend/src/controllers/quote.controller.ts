import { Request, Response } from 'express';
import { prisma } from '../db';

export async function listQuotes(req: Request, res: Response) {
  const tenantId = res.locals.tenantId;
  const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
  const data = await prisma.quote.findMany({
    where: { tenantId, ...(projectId ? { projectId } : {}) },
    orderBy: { id: 'desc' }
  });
  res.json(data);
}

export async function createQuote(req: Request, res: Response) {
  const tenantId = res.locals.tenantId;
  const { projectId, clientName, total, status } = req.body;

  // Validar que el proyecto pertenezca al tenant
  const proj = await prisma.project.findFirst({ where: { id: Number(projectId), tenantId } });
  if (!proj) return res.status(400).json({ error: 'Invalid projectId for this tenant' });

  const created = await prisma.quote.create({
    data: {
      tenantId,
      projectId: Number(projectId),
      clientName,
      total: total ?? null,
      status: status ?? 'BORRADOR'
    }
  });
  res.status(201).json(created);
}

export async function getQuoteById(req: Request, res: Response) {
  const tenantId = res.locals.tenantId;
  const id = Number(req.params.id);
  const data = await prisma.quote.findFirst({ where: { id, tenantId } });
  if (!data) return res.status(404).json({ error: 'not found' });
  res.json(data);
}

export async function updateQuote(req: Request, res: Response) {
  const tenantId = res.locals.tenantId;
  const id = Number(req.params.id);
  const q = await prisma.quote.findFirst({ where: { id, tenantId } });
  if (!q) return res.status(404).json({ error: 'not found' });

  const { clientName, total, status } = req.body;
  const updated = await prisma.quote.update({
    where: { id },
    data: {
      ...(clientName !== undefined ? { clientName } : {}),
      ...(total !== undefined ? { total } : {}),
      ...(status !== undefined ? { status } : {})
    }
  });
  res.json(updated);
}

export async function deleteQuote(req: Request, res: Response) {
  const tenantId = res.locals.tenantId;
  const id = Number(req.params.id);
  const q = await prisma.quote.findFirst({ where: { id, tenantId } });
  if (!q) return res.status(404).json({ error: 'not found' });
  await prisma.quote.delete({ where: { id } });
  res.json({ ok: true });
}
