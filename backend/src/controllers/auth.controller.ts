import type { Request, Response } from "express";
import { prisma } from "../db";
import { admin } from "../firebaseAdmin";

/**
 * Registra/actualiza un usuario creado en Firebase Auth
 * y lo guarda en MySQL con rol CLIENTE.
 *
 * Espera:
 *  - Authorization: Bearer <idToken Firebase>
 *  - body: { name?: string }
 */
export async function registerFromAssistant(req: Request, res: Response) {
  try {
    const authHeader = req.header("Authorization") || "";
    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({ error: "Missing Bearer token" });
    }

    // Verificar token con Firebase
    const decoded = await admin.auth().verifyIdToken(token);

    const firebaseUid = decoded.uid;
    const email = decoded.email;
    const nameFromBody: string | undefined = req.body?.name;

    if (!email) {
      return res.status(400).json({
        error:
          "El token de Firebase no contiene email. Verifica la configuración de Auth.",
      });
    }

    // Guardar/actualizar usuario en MySQL
    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: {
        email,
        name: nameFromBody ?? (decoded.name ?? null),
        role: "CLIENTE",
      },
      create: {
        firebaseUid,
        email,
        name: nameFromBody ?? (decoded.name ?? null),
        role: "CLIENTE",
      },
    });

    return res.json({ ok: true, user });
  } catch (error) {
    console.error("[registerFromAssistant] error:", error);
    return res
      .status(500)
      .json({ error: "No fue posible registrar al usuario en este momento." });
  }
}
