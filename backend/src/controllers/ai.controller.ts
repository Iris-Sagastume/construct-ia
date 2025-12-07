import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import PDFDocument from "pdfkit";
import fetch from "node-fetch";

const prisma = new PrismaClient();

// Endpoint de imágenes de OpenAI (gpt-image-1)
const OPENAI_URL = "https://api.openai.com/v1/images/generations";

interface HouseFormBody {
  tipoCasa?: string;
  areaVaras?: string;
  habitaciones?: string;
  banos?: string;
  departamento?: string;
  municipio?: string;
  colonia?: string;
  piscina?: "SI" | "NO" | string;
  notasAdicionales?: string;
}

interface OpenAIImageData {
  url?: string;
  b64_json?: string;
}

interface OpenAIImageResponse {
  data: OpenAIImageData[];
}

// Imagen de ejemplo en caso de error puntual
const FALLBACK_IMAGE =
  "https://via.placeholder.com/1024x1024.png?text=Plano+no+disponible";

/**
 * Llama a OpenAI para generar una imagen con gpt-image-1.
 * Devuelve una dataURL (base64) o una URL remota. Si algo falla, usa FALLBACK_IMAGE.
 */
async function generateImageFromOpenAI(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.error(
      "[AI] OPENAI_API_KEY no está configurada. Revisa tu archivo .env"
    );
    // Igual devolvemos placeholder para no romper el flujo
    return FALLBACK_IMAGE;
  }

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
        n: 1,
        quality: "high",
      }),
    });

    if (!response.ok) {
      const errJson: any = await response.json().catch(() => null);
      console.error("❌ OpenAI Error:", errJson || (await response.text()));

      const code = errJson?.error?.code;
      if (code === "billing_hard_limit_reached") {
        console.error(
          "[AI] Límite de facturación alcanzado en OpenAI. Verifica tu cuenta."
        );
      }

      throw new Error("Error generando imagen con OpenAI");
    }

    const data = (await response.json()) as OpenAIImageResponse;
    const imgData = data?.data?.[0];

    if (!imgData) {
      console.warn("[AI] OpenAI no devolvió datos de imagen. Usando placeholder.");
      return FALLBACK_IMAGE;
    }

    if (imgData.b64_json) {
      return `data:image/png;base64,${imgData.b64_json}`;
    }

    if (imgData.url) {
      return imgData.url;
    }

    console.warn("[AI] Respuesta de imagen no utilizable. Usando placeholder.");
    return FALLBACK_IMAGE;
  } catch (err) {
    console.error("❌ Error llamando a OpenAI:", err);
    return FALLBACK_IMAGE;
  }
}

// -----------------------------------------------------------------------------
// 1) Generar PLANO + RENDER y costo en Lempiras
// -----------------------------------------------------------------------------
export async function generateHouseImage(
  req: Request<{}, any, HouseFormBody>,
  res: Response
) {
  try {
    console.log("[AI] Body recibido:", req.body);

    const {
      tipoCasa,
      areaVaras,
      habitaciones,
      banos,
      departamento,
      municipio,
      colonia,
      piscina,
      notasAdicionales,
    } = req.body || {};

    // ---------------- Sanitización de datos ----------------
    const safeTipoCasa = (tipoCasa || "casa residencial").toString();
    const safeAreaVaras = parseInt(areaVaras || "200", 10) || 200;
    const safeHabitaciones = parseInt(habitaciones || "3", 10) || 3;
    const safeBanos = parseInt(banos || "2", 10) || 2;
    const safeDepartamento = (departamento || "Cortés").toString();
    const safeMunicipio = (municipio || "San Pedro Sula").toString();
    const safeColonia = (colonia || "Residencial de referencia").toString();

    const piscinaBool =
      (piscina || "").toString().toUpperCase().startsWith("S");

    const safeNotas =
      notasAdicionales && notasAdicionales.toLowerCase() !== "no"
        ? notasAdicionales
        : "Sin notas adicionales";

    // ---------------- Cálculo de costo (Lempiras) ----------------
    let costoPorVaraLps = 4500;
    const tipoLower = safeTipoCasa.toLowerCase();

    if (tipoLower.includes("moderna") || tipoLower.includes("minimalista")) {
      costoPorVaraLps = 6500;
    } else if (
      tipoLower.includes("rústica") ||
      tipoLower.includes("rustica") ||
      tipoLower.includes("económica") ||
      tipoLower.includes("economica") ||
      tipoLower.includes("sencilla")
    ) {
      costoPorVaraLps = 2800;
    }

    const extraPiscinaLps = piscinaBool ? 300_000 : 0;
    const costoTotalLps = safeAreaVaras * costoPorVaraLps + extraPiscinaLps;
    const estimatedCostLps = Math.round(costoTotalLps);

    console.log(
      `[AI] Costo estimado: L. ${estimatedCostLps.toLocaleString("es-HN")}`
    );

    // -----------------------------------------------------------------
    // Prompt 1: PLANO TÉCNICO (blueprint)
    // -----------------------------------------------------------------
    const blueprintPrompt = `
Genera un PLANO TÉCNICO ARQUITECTÓNICO de una casa residencial en Honduras.

Características:
- Tipo de casa: ${safeTipoCasa}
- Área aproximada: ${safeAreaVaras} varas cuadradas
- Habitaciones: ${safeHabitaciones}
- Baños: ${safeBanos}
- Ubicación de referencia: ${safeColonia}, ${safeMunicipio}, ${safeDepartamento}
- Piscina: ${piscinaBool ? "Incluir piscina" : "No incluir piscina"}

Formato:
- Vista superior tipo blueprint / CAD.
- Fondo azul con líneas blancas o claras.
- Paredes marcadas con líneas fuertes.
- Puertas y ventanas visibles.
- Etiquetas de áreas principales (sala, comedor, cocina, habitaciones, baños).
- Medidas aproximadas, no exactas.
`.trim();

    // -----------------------------------------------------------------
    // Prompt 2: RENDER DE LA CASA (fachada)
    // -----------------------------------------------------------------
    const renderPrompt = `
Genera un RENDER ILUSTRADO de la FACHADA de una casa residencial en Honduras.

Características:
- Tipo de casa: ${safeTipoCasa}
- Área aproximada: ${safeAreaVaras} varas cuadradas.
- Habitaciones: ${safeHabitaciones}
- Baños: ${safeBanos}
- Piscina: ${piscinaBool ? "Incluir piscina visible en el entorno" : "No mostrar piscina"}

Estilo:
- Ilustración arquitectónica, no hiperrealista.
- Fachada moderna y limpia.
- Colores neutros y cálidos.
- Iluminación agradable, estilo atardecer suave.
- Entorno con vegetación moderada.

Notas adicionales del cliente:
${safeNotas}
`.trim();

    console.log("[AI] Generando PLANO (blueprint)...");
    const blueprintUrl = await generateImageFromOpenAI(blueprintPrompt);

    console.log("[AI] Generando RENDER de la casa...");
    const renderUrl = await generateImageFromOpenAI(renderPrompt);

    console.log("[AI] Imágenes generadas correctamente (o placeholder).");

    // -----------------------------------------------------------------
    // Guardar en BD
    // -----------------------------------------------------------------
    const savedDesign = await prisma.houseDesign.create({
      data: {
        tipoCasa: safeTipoCasa,
        areaVaras: safeAreaVaras,
        habitaciones: safeHabitaciones,
        banos: safeBanos,
        departamento: safeDepartamento,
        municipio: safeMunicipio,
        colonia: safeColonia,
        piscina: piscinaBool ? "SI" : "NO", // STRING en el schema
        notasAdicionales: safeNotas,
        estimatedCostUsd: estimatedCostLps, // guardamos Lempiras aquí
        imageUrl: blueprintUrl,
        renderUrl: renderUrl,
      },
    });

    return res.json({
      imageUrl: blueprintUrl, // usado por el chat
      blueprintUrl,
      renderUrl,
      designId: savedDesign.id,
      estimatedCostUsd: estimatedCostLps,
    });
  } catch (error: any) {
    console.error("❌ Error interno:", error);
    return res.status(500).json({
      error: "Error interno generando la cotización.",
      detail: error.message || String(error),
    });
  }
}

// -----------------------------------------------------------------------------
// Helper para convertir dataURL o URL en Buffer
// -----------------------------------------------------------------------------
async function fetchImageBufferFromUrlOrDataUrl(url: string): Promise<Buffer> {
  if (url.startsWith("data:image")) {
    const base64 = url.split(",")[1];
    return Buffer.from(base64, "base64");
  } else {
    const imgRes = await fetch(url);
    if (!imgRes.ok) {
      const txt = await imgRes.text();
      console.error("❌ Error descargando imagen:", txt);
      throw new Error("No se pudo descargar la imagen remota.");
    }
    return Buffer.from(await imgRes.arrayBuffer());
  }
}

// -----------------------------------------------------------------------------
// 2) Descargar diseño en PDF – Página 1 datos, 2 plano, 3 render
// -----------------------------------------------------------------------------
export async function downloadHouseDesignPdf(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });

    const design = await prisma.houseDesign.findUnique({
      where: { id },
    });

    if (!design) {
      return res.status(404).json({ error: "Diseño no encontrado" });
    }

    // Puede venir como Decimal, lo convertimos a número seguro
    const estimated = Number(design.estimatedCostUsd);
    const estimatedText = isNaN(estimated)
      ? String(design.estimatedCostUsd)
      : estimated.toLocaleString("es-HN");

    // Obtenemos buffers de plano y render
    const blueprintBuffer = await fetchImageBufferFromUrlOrDataUrl(
      design.imageUrl
    );

    let renderBuffer: Buffer | null = null;
    if (design.renderUrl) {
      try {
        renderBuffer = await fetchImageBufferFromUrlOrDataUrl(design.renderUrl);
      } catch (err) {
        console.error("⚠️ No se pudo descargar el render:", err);
        renderBuffer = null;
      }
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="diseno-casa-${design.id}.pdf"`
    );

    const doc = new PDFDocument({ autoFirstPage: false });
    doc.pipe(res as any);

    // Página 1 – Datos generales
    doc.addPage({ size: "A4", margin: 40 });

    doc.fontSize(18).text("Construct-IA – Diseño de Casa", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12).text(`ID de diseño: ${design.id}`);
    doc.text(`Fecha: ${design.createdAt.toISOString().substring(0, 10)}`);
    doc.moveDown();

    doc.text(`Tipo de casa: ${design.tipoCasa}`);
    doc.text(`Área: ${design.areaVaras} varas²`);
    doc.text(`Habitaciones: ${design.habitaciones}`);
    doc.text(`Baños: ${design.banos}`);
    doc.text(
      `Ubicación: ${design.colonia}, ${design.municipio}, ${design.departamento}`
    );
    doc.text(`Piscina: ${design.piscina === "SI" ? "Sí" : "No"}`);
    doc.moveDown();

    if (design.notasAdicionales) {
      doc.text(`Notas adicionales: ${design.notasAdicionales}`);
      doc.moveDown();
    }

    doc
      .fontSize(14)
      .text(`Inversión estimada: L. ${estimatedText}`, {
        underline: true,
      });

    doc.moveDown();

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "Este valor es aproximado y puede variar según materiales, mano de obra y acabados.",
        { align: "left" }
      );
    doc.fillColor("black");

    // Página 2 – PLANO (blueprint)
    doc.addPage({ size: "A4", margin: 40 });

    doc.fontSize(14).text("Plano arquitectónico generado por IA:", {
      align: "center",
    });
    doc.moveDown();

    doc.image(blueprintBuffer, {
      fit: [500, 500],
      align: "center",
      valign: "center",
    });

    // Página 3 – RENDER (si existe)
    if (renderBuffer) {
      doc.addPage({ size: "A4", margin: 40 });

      doc.fontSize(14).text("Render ilustrado de la vivienda:", {
        align: "center",
      });
      doc.moveDown();

      doc.image(renderBuffer, {
        fit: [500, 500],
        align: "center",
        valign: "center",
      });
    }

    doc.end();
  } catch (error: any) {
    console.error("❌ Error generando PDF:", error);
    return res.status(500).json({
      error: "Error interno generando PDF.",
      detail: error.message || String(error),
    });
  }
}
