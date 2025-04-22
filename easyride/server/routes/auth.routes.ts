// routes/auth.routes.ts
import { Router } from "express";
import { login, logout, checkAuth } from "../controllers/auth.controller.ts";

import { isAuthenticated } from '../middlewares/authMiddleware.ts';

const router = Router();

router.post('/login', login);
router.post("/logout",isAuthenticated, logout);
router.get("/user",isAuthenticated, checkAuth);

export default router;
