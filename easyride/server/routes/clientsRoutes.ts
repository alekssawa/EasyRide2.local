import express from 'express';
import {
  getClients,
  createClient,
  updateClient,
  checkClient,
} from '../controllers/clientController.ts'; // 👈 не забудь расширение .js при ESM

import { isAuthenticated } from '../middlewares/authMiddleware.ts';



const router = express.Router();

router.get('/clients', isAuthenticated, getClients);
router.post('/clients', createClient);
router.post('/check-client', checkClient);
router.put('/clients/:id', updateClient);


export default router;