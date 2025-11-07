import { z } from 'zod';

export const companyCreateSchema = z.object({
  name: z.string().min(2),
});

export const projectCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  companyId: z.number().int().positive(),
});
