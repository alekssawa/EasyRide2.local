import { Router } from 'express';
import { getOrdersByClientId } from '../controllers/orderController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.ts';

const router = Router();

router.get('/:clientId', isAuthenticated, getOrdersByClientId);

export default router;