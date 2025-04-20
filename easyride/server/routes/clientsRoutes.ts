import express from 'express';
import {
  getClients,
  createClient,
  updateClient,
  login,
  getClientById,
} from '../controllers/clientController.ts'; // 👈 не забудь расширение .js при ESM

import { isAuthenticated } from '../middlewares/authMiddleware.ts';



const router = express.Router();

router.get('/clients', isAuthenticated, getClients);
router.get('/client/:id', isAuthenticated, getClientById);
router.post('/clients', createClient);
router.post('/login', login);
router.put('/clients/:id', updateClient);


export default router;