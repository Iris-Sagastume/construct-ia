// src/controllers/prequote.controller.ts
import { Request, Response } from "express";
import { prisma } from "../db";

// POST /assistant/pre-quotes
// Crea una precotización desde el asistente
export async function createPreQuoteFromAssistant(req: Request, res: Response) {
  try {
    const {
      ticket,
      estimatedCostLps,
      builder,
      ferreteria,
      bankName,
      bankRate,
      contactEmail,
      contactPhone,
      contactMode,
      contactPlace,
      contactVirtualOption,
      houseDesignId,
    } = req.body;

    if (
      !ticket ||
      !estimatedCostLps ||
      !contactEmail ||
      !contactPhone ||
      !contactMode ||
      !houseDesignId
    ) {
      return res.status(400).json({
        error:
          "Faltan campos obligatorios (ticket, estimatedCostLps, contactEmail, contactPhone, contactMode, houseDesignId).",
      });
    }

    // Intentar vincular con un User por email (si ya está registrado)
    const user = await prisma.user.findUnique({
      where: { email: contactEmail },
    });

    const preQuote = await prisma.preQuote.create({
      data: {
        ticket,
        estimatedCostLps,
        builder,
        ferreteria,
        bankName,
        bankRate,
        contactEmail,
        contactPhone,
        contactMode,
        contactPlace,
        contactVirtualOption,
        houseDesign: { connect: { id: houseDesignId } },
        user: user ? { connect: { id: user.id } } : undefined,
      },
    });

    return res.status(201).json(preQuote);
  } catch (error) {
    console.error("[createPreQuoteFromAssistant] error:", error);
    return res.status(500).json({ error: "Error creando la pre–cotización" });
  }
}

// GET /assistant/pre-quotes?email=...
// Lista todas las precotizaciones de un correo
export async function listPreQuotesByEmail(req: Request, res: Response) {
  try {
    const email = String(req.query.email || "").trim();
    if (!email) {
      return res
        .status(400)
        .json({ error: "Debes enviar el parámetro email en la query." });
    }

    const preQuotes = await prisma.preQuote.findMany({
      where: { contactEmail: email },
      include: { houseDesign: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json(preQuotes);
  } catch (error) {
    console.error("[listPreQuotesByEmail] error:", error);
    return res
      .status(500)
      .json({ error: "Error listando pre–cotizaciones por email" });
  }
}

// GET /assistant/pre-quotes/:ticket?email=...
// Busca una precotización por ticket (y opcionalmente valida el email)
export async function getPreQuoteByTicket(req: Request, res: Response) {
  try {
    const { ticket } = req.params;
    const email = req.query.email ? String(req.query.email).trim() : undefined;

    if (!ticket) {
      return res.status(400).json({ error: "Debes enviar el ticket." });
    }

    const preQuote = await prisma.preQuote.findFirst({
      where: {
        ticket,
        ...(email ? { contactEmail: email } : {}),
      },
      include: { houseDesign: true },
    });

    if (!preQuote) {
      return res.status(404).json({
        error: "No se encontró ninguna pre–cotización con ese ticket.",
      });
    }

    return res.json(preQuote);
  } catch (error) {
    console.error("[getPreQuoteByTicket] error:", error);
    return res.status(500).json({
      error: "Error consultando la pre–cotización por ticket",
    });
  }
}

