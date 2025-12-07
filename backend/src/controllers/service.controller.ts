import { Request, Response } from 'express';
import { prisma } from '../db';

export async function listServices(req: Request, res: Response) {
  const tenantId = res.locals.tenantId;
  const data = await prisma.service.findMany({
    where: { tenantId }, orderBy: { id: 'desc' }
  });
  res.json(data);
}

export async function createService(req: Request, res: Response) {
  const tenantId = res.locals.tenantId;
  const { name, description, price } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' });
  const created = await prisma.service.create({
    data: { tenantId, name, description: description ?? null, price: price ?? null }
  });
  res.status(201).json(created);
}

export async function getServiceById(req: Request, res: Response) {
  const tenantId = res.locals.tenantId;
  const id = Number(req.params.id);
  const data = await prisma.service.findFirst({ where: { id, tenantId } });
  if (!data) return res.status(404).json({ error: 'not found' });
  res.json(data);
}

export async function updateService(req: Request, res: Response) {
  const tenantId = res.locals.tenantId;
  const id = Number(req.params.id);
  const svc = await prisma.service.findFirst({ where: { id, tenantId } });
  if (!svc) return res.status(404).json({ error: 'not found' });

  const { name, description, price } = req.body;
  const updated = await prisma.service.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price } : {})
    }
  });
  res.json(updated);
}

export async function deleteService(req: Request, res: Response) {
  const tenantId = res.locals.tenantId;
  const id = Number(req.params.id);
  const svc = await prisma.service.findFirst({ where: { id, tenantId } });
  if (!svc) return res.status(404).json({ error: 'not found' });
  await prisma.service.delete({ where: { id } });
  res.json({ ok: true });
}
