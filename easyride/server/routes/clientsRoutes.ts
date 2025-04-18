import express from 'express';
import {
  getClients,
  createClient,
  updateClient,
} from '../controllers/clientController.ts'; // 👈 не забудь расширение .js при ESM

const router = express.Router();

router.get('/clients', getClients);
router.post('/clients', createClient);
router.put('/clients/:id', updateClient);

export default router;