// src/controllers/allied-quotes.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Devuelve las pre–cotizaciones asociadas a un aliado
 * (constructora, ferretería o banco) según la solicitud
 * aprobada que está ligada a su correo.
 *
 * GET /allies/pre-quotes?email=usuarioX@gmail.com
 */
export async function listPreQuotesForAllied(req: Request, res: Response) {
  const email = (req.query.email as string | undefined)?.trim();

  if (!email) {
    return res.status(400).json({ message: "El email es requerido." });
  }

  try {
    // 1) Buscar la solicitud APROBADA más reciente de ese correo
    const solicitud = await prisma.solicitud.findFirst({
      where: {
        email,
        estado: "APROBADA",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!solicitud) {
      // No tiene solicitud aprobada → no hay cotizaciones para mostrar
      return res.json([]);
    }

    // 2) Armar filtro según tipo de solicitud
    const wherePre: any = {};
    if (solicitud.tipo === "CONSTRUCTORA") {
      wherePre.builder = solicitud.nombre;
    } else if (solicitud.tipo === "FERRETERIA") {
      wherePre.ferreteria = solicitud.nombre;
    } else if (solicitud.tipo === "BANCO") {
      wherePre.bankName = solicitud.nombre;
    }

    // 3) Buscar las pre–cotizaciones que coincidan
    const prequotes = await prisma.preQuote.findMany({
      where: wherePre,
      include: {
        houseDesign: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 4) Formato de respuesta simplificado para el frontend
    const response = prequotes.map((p) => ({
      ticket: p.ticket,
      createdAt: p.createdAt,
      status: p.status,
      estimatedCostLps: p.estimatedCostLps,
      companyName: solicitud.nombre,
      companyType: solicitud.tipo, // "CONSTRUCTORA" | "FERRETERIA" | "BANCO"
      houseDesign: p.houseDesign,
    }));

    return res.json(response);
  } catch (error) {
    console.error("Error en listPreQuotesForAllied:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener las cotizaciones del aliado." });
  }
}
