import { Router } from 'express';
import { getOrdersByClientId, getOrdersByDriverId, getFreeDrivers, createOrder, cancelOrder, completeOrder } from '../controllers/order.controller.js';
import { isAuthenticated } from '../middlewares/authMiddleware.ts';

const router = Router();

router.get('/client/:clientId', isAuthenticated, getOrdersByClientId);
router.get('/driver/:driverId', isAuthenticated, getOrdersByDriverId);

router.get('/getFreeDrivers', getFreeDrivers)

router.post('/create', isAuthenticated, createOrder);

router.put('/:orderId/cancel', isAuthenticated, cancelOrder);

router.put('/:orderId/complete', isAuthenticated, completeOrder);


export default router;