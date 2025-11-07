// src/index.ts
import express from 'express';
import cors from 'cors';
import { router } from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// endpoints básicos
app.get('/', (_req, res) => res.send('Construct IA API'));
app.get('/health', (_req, res) => res.send('ok'));

// monta todo el CRUD bajo /api
app.use('/api', router);

// manejador de errores por si algún controller lanza next(err)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal error' });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
