import express, { Request, Response } from 'express';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // API маршрут (пример)
  server.get('/api/hello', (req: Request, res: Response) => {
    res.json({ message: 'Hello from Express' });
  });

  // Обработка всех остальных маршрутов через Next.js
  server.use((req: Request, res: Response) => {
    return handle(req, res);
  });

  server.listen(3000, (err?: Error) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
