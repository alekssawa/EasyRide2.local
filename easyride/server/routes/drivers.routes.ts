import express from 'express';
import {
  getDrivers,
  // createClient,
  updateDriver,
  getDriverById,
} from '../controllers/driver.controller.ts'; // 👈 не забудь расширение .js при ESM

import { isAuthenticated } from '../middlewares/authMiddleware.ts';



const router = express.Router();

router.get('/getDrivers', isAuthenticated, getDrivers);
router.get('/getDriver/:id', isAuthenticated, getDriverById);
// router.post('/clients', createClient);

router.put('/driver/:id', isAuthenticated, updateDriver);


export default router;