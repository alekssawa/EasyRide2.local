import express from "express";
import { startRouteAnimation } from "../services/route.service.ts";

const router = express.Router();

router.post("/route", async (req, res) => {
  try {
    const { order_id, driver, from, to } = req.body;
    if (!order_id || !driver || !from || !to) throw new Error("Missing parameters");
    
    await startRouteAnimation(order_id, driver, from, to);
    res.json({ message: "Маршрут запущен" });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Ошибка сервера" });
  }
});

export default router;