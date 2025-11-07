// src/middlewares/tenant.ts
import { Request, Response, NextFunction } from 'express';

export function tenantGuard(req: Request, res: Response, next: NextFunction) {
  const v = (req.header('x-tenant-id') || '').trim();
  if (!v) return res.status(400).json({ error: 'Missing x-tenant-id header' });
  (req as any).tenantId = v;
  next();
}
