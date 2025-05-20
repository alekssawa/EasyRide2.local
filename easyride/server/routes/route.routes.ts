import express from "express";
import { 
  startRouteAnimation,
  stopRouteAnimation,   
  getActiveRoutes,
  updateRouteSimulation,
  AllClientsView,
  getRouteSimulationSettings } from "../services/route.service.ts";

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

router.get("/routes/active", async (req, res) => {
  try {
    const activeRoutes = getActiveRoutes();
    
    res.json({
      message: "Список активных симуляций",
      count: activeRoutes.length,
      active_routes: activeRoutes.map(id => ({
        order_id: id,
        settings: getRouteSimulationSettings(id)
      }))
    });
  } catch (e) {
    res.status(500).json({ 
      error: e instanceof Error ? e.message : "Ошибка сервера" 
    });
  }
});

router.patch("/route/:order_id/settings", async (req, res) => {
  try {
    const { order_id } = req.params;
    const { isDriving, speed } = req.body;
    
    if (!order_id) throw new Error("Order ID is required");
    
    await updateRouteSimulation(Number(order_id), { isDriving, speed });
    res.json({ 
      message: "Настройки симуляции обновлены",
      settings: getRouteSimulationSettings(Number(order_id))
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Ошибка сервера" });
  }
});

router.get("/route/:order_id/settings", async (req, res) => {
  try {
    const { order_id } = req.params;
    
    if (!order_id) throw new Error("Order ID is required");
    
    const settings = getRouteSimulationSettings(Number(order_id));
    if (!settings) {
      res.status(404).json({ error: "Симуляция не найдена" });
      return 
    }
    
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Ошибка сервера" });
  }
});

router.delete("/route/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;
    
    if (!order_id) {
      throw new Error("Order ID is required");
    }
    
    await stopRouteAnimation(Number(order_id));
    res.json({ 
      message: "Симуляция маршрута остановлена",
      order_id
    });
  } catch (e) {
    res.status(500).json({ 
      error: e instanceof Error ? e.message : "Ошибка сервера",
      order_id: req.params.order_id
    });
  }
});

router.get("/route/AllClientsView", AllClientsView);


export default router;