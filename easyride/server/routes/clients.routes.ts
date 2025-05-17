import express from 'express';
import {
  getClients,
  createClient,
  updateClient,
  patchClient,
  getClientById,
  deleteClientAvatar,
  getOrdersByClientId,
  getAvatarUploadUrl
} from '../controllers/client.controller.ts'; // 👈 не забудь расширение .js при ESM

import { isAuthenticated } from '../middlewares/authMiddleware.ts';



const router = express.Router();

router.get('/getClients', isAuthenticated, getClients);
router.get('/getClient/:id', isAuthenticated, getClientById);
router.post('/clients', createClient);

router.put('/:id', isAuthenticated, updateClient);
router.patch("/:id",isAuthenticated, patchClient);

router.delete('/:id/avatar', isAuthenticated, deleteClientAvatar);
router.get('/:id/orders', isAuthenticated, getOrdersByClientId);
router.get('/avatar/upload-url', isAuthenticated, getAvatarUploadUrl);


export default router;