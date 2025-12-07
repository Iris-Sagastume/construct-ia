// src/index.ts
import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient, SolicitudEstado } from "@prisma/client";
import { router } from "./routes";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-tenant-id", "Authorization"],
  })
);

// Servir archivos subidos (fotos de perfil)
app.use("/uploads", express.static("uploads"));

// Log simple
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log("REQ:", req.method, req.url);
  next();
});

// ================== RUTAS API PRINCIPALES ==================
app.use("/api", router);

// ---------- SOLICITUDES ADMIN ----------

// Listar solicitudes
app.get("/api/admin/solicitudes", async (_req: Request, res: Response) => {
  try {
    const solicitudesDb = await prisma.solicitud.findMany({
      orderBy: { createdAt: "desc" },
    });

    const result = solicitudesDb.map((s) => ({
      id: s.id,
      type: s.tipo,          // CONSTRUCTORA | FERRETERIA | BANCO
      name: s.nombre,
      email: s.email,
      status: s.estado,      // PENDIENTE | APROBADA | RECHAZADA
      interestRate: s.tasaInteres,
      createdAt: s.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({ message: "Error al obtener solicitudes" });
  }
});

// Actualizar estado (Aprobar / Rechazar)
app.put("/api/admin/solicitudes/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body as { status: SolicitudEstado | string };

    // Validar estado
    if (
      status !== "PENDIENTE" &&
      status !== "APROBADA" &&
      status !== "RECHAZADA"
    ) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const updated = await prisma.solicitud.update({
      where: { id },
      data: { estado: status as SolicitudEstado },
    });

    const dto = {
      id: updated.id,
      type: updated.tipo,
      name: updated.nombre,
      email: updated.email,
      status: updated.estado,
      interestRate: updated.tasaInteres,
      createdAt: updated.createdAt.toISOString(),
    };

    res.json(dto);
  } catch (error) {
    console.error("Error al actualizar solicitud:", error);
    res.status(500).json({ message: "Error al actualizar la solicitud" });
  }
});

// Eliminar solicitud
app.delete(
  "/api/admin/solicitudes/:id",
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      await prisma.solicitud.delete({
        where: { id },
      });

      res.status(204).send(); // sin contenido, pero OK
    } catch (error) {
      console.error("Error al eliminar solicitud:", error);
      res.status(500).json({ message: "Error al eliminar la solicitud" });
    }
  }
);

// ---------- COTIZACIONES ADMIN ----------

/**
 * DTO helper: convierte un PreQuote (con relaciones) en el formato que usará el frontend
 */
function mapPreQuoteToDto(pq: any) {
  const hd = pq.houseDesign;

  const house = hd
    ? {
        tipoCasa: hd.tipoCasa,
        areaVaras: hd.areaVaras,
        habitaciones: hd.habitaciones,
        banos: hd.banos,
        departamento: hd.departamento,
        municipio: hd.municipio,
        colonia: hd.colonia,
      }
    : null;

  return {
    id: pq.id,
    ticket: pq.ticket,
    // Nombre del cliente: primero User.nombre, si no hay, usamos el correo
    clientName: pq.user?.name ?? pq.contactEmail,
    contactEmail: pq.contactEmail,
    total: pq.estimatedCostLps,
    status: pq.status, // "PENDIENTE", "BORRADOR", "ENVIADA", "ACEPTADA", "RECHAZADA", etc.
    createdAt: pq.createdAt.toISOString(),
    house,
  };
}

// Listar cotizaciones (PreQuote + HouseDesign)
app.get("/api/admin/quotes", async (_req: Request, res: Response) => {
  try {
    const prequotes = await prisma.preQuote.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        houseDesign: true,
        user: true,
      },
    });

    res.json(prequotes.map(mapPreQuoteToDto));
  } catch (error) {
    console.error("Error al obtener cotizaciones:", error);
    res.status(500).json({ message: "Error al obtener cotizaciones" });
  }
});

// Crear cotización manual (PreQuote)
app.post("/api/admin/quotes", async (req: Request, res: Response) => {
  try {
    const {
      houseDesignId,
      clientName,
      contactEmail,
      total,
      status,
    } = req.body as {
      houseDesignId: number;
      clientName: string;
      contactEmail: string;
      total: number;
      status: string;
    };

    if (!houseDesignId || !contactEmail || !total) {
      return res
        .status(400)
        .json({ message: "houseDesignId, contactEmail y total son requeridos." });
    }

    const created = await prisma.preQuote.create({
      data: {
        ticket: `Q-${Date.now()}`,
        houseDesignId,
        estimatedCostLps: Number(total),
        contactEmail,
        contactPhone: "",
        contactMode: "VIRTUAL",
        contactPlace: null,
        contactVirtualOption: "WhatsApp",
        status: status || "BORRADOR",
        userId: null,
        builder: null,
        ferreteria: null,
        bankName: null,
        bankRate: null,
      },
      include: {
        houseDesign: true,
        user: true,
      },
    });

    res.status(201).json(mapPreQuoteToDto(created));
  } catch (error) {
    console.error("Error al crear cotización:", error);
    res.status(500).json({ message: "Error al crear la cotización" });
  }
});

// Actualizar cotización (total y/o estado)
app.put("/api/admin/quotes/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { total, status } = req.body as {
      total?: number;
      status?: string;
    };

    const data: any = {};
    if (typeof total === "number") data.estimatedCostLps = total;
    if (status) data.status = status;

    const updated = await prisma.preQuote.update({
      where: { id },
      data,
      include: {
        houseDesign: true,
        user: true,
      },
    });

    res.json(mapPreQuoteToDto(updated));
  } catch (error) {
    console.error("Error al actualizar cotización:", error);
    res.status(500).json({ message: "Error al actualizar la cotización" });
  }
});

// Eliminar cotización
app.delete("/api/admin/quotes/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.preQuote.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar cotización:", error);
    res.status(500).json({ message: "Error al eliminar la cotización" });
  }
});


// ---------- RUTAS EXTRA ----------
app.get("/", (_req: Request, res: Response) => res.send("Construct IA API"));
app.get("/health", (_req: Request, res: Response) => res.send("ok"));

// Middleware 404 SIEMPRE AL FINAL
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// ---------- SERVER ----------
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});

