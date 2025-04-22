import { Router } from 'express';
import { getOrdersByClientId, getOrdersByDriverId } from '../controllers/order.controller.js';
import { isAuthenticated } from '../middlewares/authMiddleware.ts';

const router = Router();

router.get('/client/:clientId', isAuthenticated, getOrdersByClientId);
router.get('/driver/:driverId', isAuthenticated, getOrdersByDriverId);

export default router;