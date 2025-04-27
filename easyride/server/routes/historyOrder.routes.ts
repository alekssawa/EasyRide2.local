import { Router } from 'express';
import { getTripHistoryByClientId, getTripHistoryByDriverId } from '../controllers/HistoryOrder.controller.ts';
import { isAuthenticated } from '../middlewares/authMiddleware.ts';

const router = Router();

router.get('/client/:clientId', isAuthenticated, getTripHistoryByClientId);
router.get('/driver/:driverId', isAuthenticated, getTripHistoryByDriverId);

export default router;