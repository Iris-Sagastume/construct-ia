import { Router } from 'express';
import { tenantGuard } from './middlewares/tenant';
import { listCompanies, createCompany, getCompanyById, updateCompany, deleteCompany } from './controllers/company.controller';
import { listProjects, createProject, getProjectById, updateProject, deleteProject } from './controllers/project.controller';

export const router = Router();
router.use(tenantGuard);

// companies
router.get('/companies', listCompanies);
router.get('/companies/:id', getCompanyById);
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.delete('/companies/:id', deleteCompany);

// projects
router.get('/projects', listProjects);
router.get('/projects/:id', getProjectById);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);
