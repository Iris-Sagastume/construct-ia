// src/middlewares/tenant.ts
import { Request, Response, NextFunction } from "express";

export function tenantGuard(req: Request, _res: Response, next: NextFunction) {
  let tenant = (req.header("x-tenant-id") || "").trim();

  if (!tenant) {
    tenant = "default";
  }

  (req as any).tenantId = tenant;
  next(); // nunca devolvemos error aquí
}
