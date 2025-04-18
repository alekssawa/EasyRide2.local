import express from 'express';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient
} from '../controllers/clientController.ts'; // 👈 не забудь расширение .js при ESM

const router = express.Router();

router.get('/clients', getClients);
router.post('/clients', createClient);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);

export default router;