// src/routes.ts
import { Router } from "express";
import { tenantGuard } from "./middlewares/tenant";

// src/routes.ts
import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  listUsers,
  updateUserRole,
} from "./controllers/user.controller";

// ---------------------- PreQuotes Controllers ----------------------
import {
  createPreQuoteFromAssistant,
  listPreQuotesByEmail,
  getPreQuoteByTicket,
} from "./controllers/prequote.controller";

// ---------------------- Auth Controller ----------------------
import { registerFromAssistant } from "./controllers/auth.controller";

// ---------------------- Companies ----------------------
import {
  listCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "./controllers/company.controller";

// ---------------------- Projects ----------------------
import {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "./controllers/project.controller";

// ---------------------- Services ----------------------
import {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "./controllers/service.controller";

// ---------------------- Quotes ----------------------
import {
  listQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
} from "./controllers/quote.controller";

// ---------------------- AI Controller ----------------------
import {
  generateHouseImage,
  downloadHouseDesignPdf,
} from "./controllers/ai.controller";

// ---------------------- Solicitudes ----------------------
import {
  createSolicitud,
  listSolicitudes,
  getSolicitudById,
  updateSolicitud,
  deleteSolicitud,
  listSolicitudesByEmail,
} from "./controllers/solicitud.controller";

// ---------------------- Allied Quotes (Constructora/Ferretería/Banco) ----------------------
import { listPreQuotesForAllied } from "./controllers/allied-quotes.controller";


export const router = Router();

/**
 * Rutas SIN tenant (antes de tenantGuard)
 */

// Perfil de usuario
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.post("/me/avatar", uploadMyAvatar);

// IA
router.post("/ai/house-image", generateHouseImage);
router.get("/ai/house-design/:id/pdf", downloadHouseDesignPdf);

// Pre-Cotizaciones (NO TENANT)
router.post("/assistant/pre-quotes", createPreQuoteFromAssistant);
router.get("/assistant/pre-quotes", listPreQuotesByEmail);
router.get("/assistant/pre-quotes/:ticket", getPreQuoteByTicket);

// Auth desde asistente (NO TENANT)
router.post("/auth/register-from-assistant", registerFromAssistant);

// Cotizaciones para aliados (constructora/ferretería/banco) según su solicitud aprobada
// Ejemplo: GET /allies/pre-quotes?email=usuario1@gmail.com
router.get("/allies/pre-quotes", listPreQuotesForAllied);


/**
 * A partir de aquí, todo pasa por tenantGuard
 */
router.use(tenantGuard);

// Admin - gestión de usuarios y roles
router.get("/admin/users", listUsers);
router.put("/admin/users/:id/role", updateUserRole);


// Companies
router.get("/companies", listCompanies);
router.get("/companies/:id", getCompanyById);
router.post("/companies", createCompany);
router.put("/companies/:id", updateCompany);
router.delete("/companies/:id", deleteCompany);

// Projects
router.get("/projects", listProjects);
router.get("/projects/:id", getProjectById);
router.post("/projects", createProject);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

// Services
router.get("/services", listServices);
router.get("/services/:id", getServiceById);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

// Quotes
router.get("/quotes", listQuotes);
router.get("/quotes/:id", getQuoteById);
router.post("/quotes", createQuote);
router.put("/quotes/:id", updateQuote);
router.delete("/quotes/:id", deleteQuote);

// ---------------------- Solicitudes ----------------------
// Crear solicitud (cliente)
router.post("/solicitudes", createSolicitud);

// Listar todas (admin, con filtros si quieres)
router.get("/solicitudes", listSolicitudes);

// 👇 NUEVO: listar SOLO las solicitudes del usuario por email
// Ejemplo: GET /api/solicitudes/my?email=usuario1@gmail.com
router.get("/solicitudes/my", listSolicitudesByEmail);

// Obtener, actualizar y eliminar por id (admin)
router.get("/solicitudes/:id", getSolicitudById);
router.put("/solicitudes/:id", updateSolicitud);
router.delete("/solicitudes/:id", deleteSolicitud);
