// src/controllers/user.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../db";

// 🔹 Todos los roles válidos en tu tabla User
export type UserRole =
  | "CLIENTE"
  | "ADMIN"
  | "CONSTRUCTORA"
  | "FERRETERIA"
  | "BANCO";

/**
 * Helper: obtiene un usuario desde el email de la query.
 * - Si createIfNotExists = true y no existe, lo crea como CLIENTE.
 * - Si createIfNotExists = false y no existe, lanza "USER_NOT_FOUND".
 */
async function getUserFromRequest(
  req: Request,
  options: { createIfNotExists?: boolean } = {}
) {
  const { createIfNotExists = false } = options;

  const email =
    typeof req.query.email === "string" ? req.query.email.trim() : "";

  if (!email) {
    throw new Error("NO_EMAIL_IN_QUERY");
  }

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user && createIfNotExists) {
    user = await prisma.user.create({
      data: {
        firebaseUid: email,
        email,
        name: null,
        role: "CLIENTE", // por defecto, pero solo cuando sí queremos autocrear
      },
    });
  }

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
}

/**
 * GET /api/me?email=...
 * 🔸 SOLO lee el usuario. No lo crea automáticamente.
 */
export async function getMyProfile(req: Request, res: Response) {
  try {
    const user = await getUserFromRequest(req, { createIfNotExists: false });

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role as UserRole,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error("[getMyProfile] error:", error);

    if (error.message === "NO_EMAIL_IN_QUERY") {
      return res
        .status(400)
        .json({ error: "Falta el parámetro email en la URL (?email=...)" });
    }

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    return res
      .status(500)
      .json({ error: "No fue posible obtener el perfil de usuario." });
  }
}

/**
 * PUT /api/me?email=...
 * 🔸 Aquí SÍ permitimos autocrear el usuario si no existe.
 */
export async function updateMyProfile(req: Request, res: Response) {
  try {
    const user = await getUserFromRequest(req, { createIfNotExists: true });

    const { name, phone, avatarUrl } = req.body as {
      name?: string;
      phone?: string;
      avatarUrl?: string;
    };

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name ?? user.name,
        phone: phone ?? user.phone,
        avatarUrl: avatarUrl ?? user.avatarUrl,
      },
    });

    return res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      avatarUrl: updated.avatarUrl,
      role: updated.role as UserRole,
      createdAt: updated.createdAt,
    });
  } catch (error: any) {
    console.error("[updateMyProfile] error:", error);

    if (error.message === "NO_EMAIL_IN_QUERY") {
      return res
        .status(400)
        .json({ error: "Falta el parámetro email en la URL (?email=...)" });
    }

    return res
      .status(500)
      .json({ error: "No fue posible actualizar el perfil de usuario." });
  }
}

/**
 * POST /api/me/avatar?email=...
 * Sube una imagen y actualiza avatarUrl
 * 🔸 También permite autocrear el usuario si no existiera.
 */
export async function uploadMyAvatar(req: Request, res: Response) {
  try {
    const user = await getUserFromRequest(req, { createIfNotExists: true });

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      console.error("[uploadMyAvatar] No se recibió archivo");
      return res.status(400).json({ error: "No se recibió archivo" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const avatarUrl = `${baseUrl}/uploads/${file.filename}`;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });

    return res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      avatarUrl: updated.avatarUrl,
      role: updated.role as UserRole,
      createdAt: updated.createdAt,
    });
  } catch (error: any) {
    console.error("[uploadMyAvatar] error:", error);

    if (error.message === "NO_EMAIL_IN_QUERY") {
      return res
        .status(400)
        .json({ error: "Falta el parámetro email en la URL (?email=...)" });
    }

    return res
      .status(500)
      .json({ error: "No fue posible subir la foto de perfil." });
  }
}

// 🔹 Listar todos los usuarios (solo para admin)
export async function listUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (err) {
    console.error("Error listUsers:", err);
    res.status(500).json({ message: "No fue posible obtener los usuarios." });
  }
}

// 🔹 Actualizar SOLO el rol de un usuario
export async function updateUserRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { role } = req.body as { role?: UserRole };

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    if (!role) {
      return res.status(400).json({ message: "El rol es obligatorio." });
    }

    const allowedRoles: UserRole[] = [
      "CLIENTE",
      "ADMIN",
      "CONSTRUCTORA",
      "FERRETERIA",
      "BANCO",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Rol no permitido." });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updateUserRole:", err);
    res.status(500).json({ message: "No fue posible actualizar el rol." });
  }
}
