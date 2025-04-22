import express from 'express';
import {
  getClients,
  createClient,
  updateClient,
  getClientById,
} from '../controllers/client.controller.ts'; // 👈 не забудь расширение .js при ESM

import { isAuthenticated } from '../middlewares/authMiddleware.ts';



const router = express.Router();

router.get('/getClients', isAuthenticated, getClients);
router.get('/getClient/:id', isAuthenticated, getClientById);
router.post('/clients', createClient);

router.put('/client/:id', isAuthenticated, updateClient);


export default router;