// src/controllers/solicitud.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Crear solicitud (desde la página de Solicitud de registro)
 */
export async function createSolicitud(req: Request, res: Response) {
  try {
    const { tipo, nombre, email, tasaInteres } = req.body;

    if (!tipo || !nombre || !email) {
      return res
        .status(400)
        .json({ message: "tipo, nombre y email son obligatorios." });
    }

    const nueva = await prisma.solicitud.create({
      data: {
        tipo, // enum SolicitudTipo
        nombre,
        email,
        tasaInteres:
          tasaInteres !== undefined && tasaInteres !== null
            ? Number(tasaInteres)
            : null,
      },
    });

    return res.status(201).json(nueva);
  } catch (error) {
    console.error("createSolicitud error:", error);
    return res
      .status(500)
      .json({ message: "Error al crear la solicitud." });
  }
}

/**
 * Listar TODAS las solicitudes (uso admin)
 */
export async function listSolicitudes(_req: Request, res: Response) {
  try {
    const items = await prisma.solicitud.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(items);
  } catch (error) {
    console.error("listSolicitudes error:", error);
    return res
      .status(500)
      .json({ message: "Error al listar las solicitudes." });
  }
}

/**
 * 🔥 NUEVO: listar SOLO las solicitudes de un usuario por email
 * GET /api/solicitudes/my?email=usuario1@gmail.com
 */
export async function listSolicitudesByEmail(req: Request, res: Response) {
  try {
    const email = (req.query.email ?? "").toString().trim();

    if (!email) {
      return res
        .status(400)
        .json({ message: "Debe enviar el parámetro email en la consulta." });
    }

    const items = await prisma.solicitud.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    return res.json(items);
  } catch (error) {
    console.error("listSolicitudesByEmail error:", error);
    return res
      .status(500)
      .json({ message: "Error al listar las solicitudes del usuario." });
  }
}

/**
 * Obtener solicitud por ID
 */
export async function getSolicitudById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const item = await prisma.solicitud.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    return res.json(item);
  } catch (error) {
    console.error("getSolicitudById error:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener la solicitud." });
  }
}

/**
 * Actualizar solicitud (normalmente para cambiar estado desde admin)
 */
export async function updateSolicitud(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const { tipo, nombre, email, tasaInteres, estado } = req.body;

    const data: any = {};
    if (tipo) data.tipo = tipo;
    if (nombre) data.nombre = nombre;
    if (email) data.email = email;
    if (tasaInteres !== undefined) data.tasaInteres = Number(tasaInteres);
    if (estado) data.estado = estado; // enum SolicitudEstado

    const updated = await prisma.solicitud.update({
      where: { id },
      data,
    });

    return res.json(updated);
  } catch (error) {
    console.error("updateSolicitud error:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la solicitud." });
  }
}

/**
 * Eliminar solicitud
 */
export async function deleteSolicitud(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    await prisma.solicitud.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("deleteSolicitud error:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar la solicitud." });
  }
}


