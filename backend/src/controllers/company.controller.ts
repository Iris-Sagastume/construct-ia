// src/controllers/company.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../db';

function parseId(param: any) {
  const id = Number(param);
  if (!Number.isFinite(id)) throw new Error('Invalid id');
  return id;
}

/** GET /api/companies */
export async function listCompanies(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as string;
    const rows = await prisma.company.findMany({
      where: { tenantId },
      orderBy: { id: 'asc' },
    });
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

/** GET /api/companies/:id */
export async function getCompanyById(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as string;
    const id = parseId(req.params.id);

    const row = await prisma.company.findFirst({ where: { id, tenantId } });
    if (!row) return res.status(404).json({ error: 'Company not found' });
    res.json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

/** POST /api/companies */
export async function createCompany(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as string;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const created = await prisma.company.create({
      data: { tenantId, name },
    });
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

/** PUT /api/companies/:id */
export async function updateCompany(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as string;
    const id = parseId(req.params.id);
    const { name } = req.body;

    const exists = await prisma.company.findFirst({ where: { id, tenantId } });
    if (!exists) return res.status(404).json({ error: 'Company not found' });

    const updated = await prisma.company.update({
      where: { id },
      data: { name: name ?? exists.name },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

/** DELETE /api/companies/:id */
export async function deleteCompany(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as string;
    const id = parseId(req.params.id);

    const exists = await prisma.company.findFirst({ where: { id, tenantId } });
    if (!exists) return res.status(404).json({ error: 'Company not found' });

    await prisma.company.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
