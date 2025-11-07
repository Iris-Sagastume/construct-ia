// src/controllers/project.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../db';
import { ProjectStatus } from '@prisma/client';

// Helpers
function toStatus(v: any): ProjectStatus | undefined {
  if (typeof v !== 'string') return undefined;
  const up = v.toUpperCase().trim();
  if ((Object.keys(ProjectStatus) as string[]).includes(up)) {
    return up as ProjectStatus;
  }
  return undefined;
}

// GET /api/projects
export async function listProjects(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as string;
    const companyId = req.query.companyId ? Number(req.query.companyId) : undefined;

    const data = await prisma.project.findMany({
      where: { tenantId, ...(companyId ? { companyId } : {}) },
      orderBy: { id: 'desc' }
    });
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

// GET /api/projects/:id
export async function getProjectById(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as string;
    const id = Number(req.params.id);

    const proj = await prisma.project.findFirst({ where: { id, tenantId } });
    if (!proj) return res.status(404).json({ error: 'Not found' });
    res.json(proj);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

// POST /api/projects
export async function createProject(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as string;
    const { name, description, status, companyId } = req.body;

    const parsedStatus = toStatus(status);
    if (!parsedStatus) {
      return res.status(400).json({ error: 'Invalid status. Use one of: ' + Object.keys(ProjectStatus).join(', ') });
    }
    if (!companyId || Number.isNaN(Number(companyId))) {
      return res.status(400).json({ error: 'companyId must be a number' });
    }

    // (Opcional) verificar que la company exista y pertenezca al mismo tenant
    const company = await prisma.company.findFirst({
      where: { id: Number(companyId), tenantId }
    });
    if (!company) return res.status(400).json({ error: 'Invalid companyId for this tenant' });

    const created = await prisma.project.create({
      data: {
        name,
        description: description ?? null,
        status: parsedStatus,
        companyId: Number(companyId),
        tenantId
      }
    });

    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

// PUT /api/projects/:id
export async function updateProject(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as string;
    const id = Number(req.params.id);
    const { name, description, status, companyId } = req.body;

    const existing = await prisma.project.findFirst({ where: { id, tenantId } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    let newStatus: ProjectStatus | undefined = undefined;
    if (status !== undefined) {
      const parsed = toStatus(status);
      if (!parsed) return res.status(400).json({ error: 'Invalid status' });
      newStatus = parsed;
    }

    let newCompanyId: number | undefined = undefined;
    if (companyId !== undefined) {
      if (Number.isNaN(Number(companyId))) {
        return res.status(400).json({ error: 'companyId must be a number' });
      }
      // validar pertenencia
      const company = await prisma.company.findFirst({
        where: { id: Number(companyId), tenantId }
      });
      if (!company) return res.status(400).json({ error: 'Invalid companyId for this tenant' });
      newCompanyId = Number(companyId);
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(newStatus !== undefined ? { status: newStatus } : {}),
        ...(newCompanyId !== undefined ? { companyId: newCompanyId } : {})
      }
    });

    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

// DELETE /api/projects/:id
export async function deleteProject(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as string;
    const id = Number(req.params.id);

    const existing = await prisma.project.findFirst({ where: { id, tenantId } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    await prisma.project.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
