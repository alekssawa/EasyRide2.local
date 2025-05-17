import express from 'express';
import {
  getDrivers,

  updateDriver,
  patchDriver,
  getDriverById,
  deleteDriverAvatar,
  getAvatarUploadUrl
} from '../controllers/driver.controller.ts'; // 👈 не забудь расширение .js при ESM

import { isAuthenticated } from '../middlewares/authMiddleware.ts';



const router = express.Router();

router.get('/getDrivers', isAuthenticated, getDrivers);
router.get('/getDriver/:id', isAuthenticated, getDriverById);


router.put('/driver/:id', isAuthenticated, updateDriver);
router.patch("/:id",isAuthenticated, patchDriver);

router.delete('/:id/avatar', isAuthenticated, deleteDriverAvatar);
router.get('/avatar/upload-url', isAuthenticated, getAvatarUploadUrl);

export default router;