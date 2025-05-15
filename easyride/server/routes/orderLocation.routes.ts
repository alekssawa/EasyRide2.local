import { Router } from 'express';
import { createOrderLocation, getOrderLocationById, deleteOrderLocationById } from '../controllers/orderLocation.controller.ts';
import { isAuthenticated } from '../middlewares/authMiddleware.ts';

const router = Router();

router.post("/", isAuthenticated, createOrderLocation);
router.get("/:order_id", isAuthenticated, getOrderLocationById);
router.delete("/:order_id", isAuthenticated, deleteOrderLocationById);


export default router;