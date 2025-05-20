import axios from "axios";
import { Request, Response } from "express";
import {
  wss,
  getActiveRoute,
  setActiveRoute,
  startRouteForClient,
  stopRoute,
  WSClient,
  updateSimulationSettings,
  getSimulationSettings,
  AllClients,
} from "../ws/wsServer.ts";

interface Point {
  lat: number;
  lng: number;
}
interface SimulationSettings {
  isDriving: boolean;
  speed: number;
}

// Функция для расчёта расстояния между двумя точками (метры)
function haversineDistance(p1: Point, p2: Point): number {
  const R = 6371000; // Радиус Земли в метрах
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Функция для интерполяции точки между двумя точками
function interpolatePoint(p1: Point, p2: Point, fraction: number): Point {
  return {
    lat: p1.lat + (p2.lat - p1.lat) * fraction,
    lng: p1.lng + (p2.lng - p1.lng) * fraction,
  };
}

// Функция для интерполяции всего маршрута с шагом stepMeters (в метрах)
function interpolateRoutePoints(
  points: Point[],
  stepMeters: number = 5
): Point[] {
  const result: Point[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

    const dist = haversineDistance(start, end);
    const numSteps = Math.max(Math.floor(dist / stepMeters), 1);

    for (let step = 0; step < numSteps; step++) {
      const fraction = step / numSteps;
      const interpPoint = interpolatePoint(start, end, fraction);
      result.push(interpPoint);
    }
  }

  // Добавляем последнюю точку маршрута
  result.push(points[points.length - 1]);

  return result;
}

export async function startRouteAnimation(
  order_id: number,
  driver: Point,
  from: Point,
  to: Point
): Promise<void> {
  // Проверяем, не запущен ли уже маршрут с этим order_id
  const currentActiveRoute = getActiveRoute(order_id);
  if (currentActiveRoute) {
    console.log(`Route with order_id ${order_id} is already running`);
    return;
  }

  // Формируем координаты для OSRM (lng,lat)
  const coords = [driver, from, to].map((c) => `${c.lng},${c.lat}`).join(";");

  const url = `http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  console.log("Starting route animation for order:", order_id);

  try {
    const res = await axios.get(url);
    if (!res.data.routes || res.data.routes.length === 0) {
      throw new Error("Route not found");
    }

    const routeCoords = res.data.routes[0].geometry.coordinates as [
      number,
      number
    ][];
    const routePoints = routeCoords.map(([lng, lat]) => ({ lat, lng }));

    const smoothRoutePoints = interpolateRoutePoints(routePoints, 5);

    setActiveRoute(order_id, smoothRoutePoints);

    const allClients = Array.from(wss.clients).map((client) => {
      const wsClient = client as WSClient;
      const socket = (wsClient as any)._socket;
      return {
        id: socket ? socket.remoteAddress + ":" + socket.remotePort : "unknown",
        readyState: client.readyState,
        subscribedOrders: wsClient.subscribedOrders ?? [],
      };
    });

    console.log("Все клиенты на сокете SERVICE:", allClients);

    const subscribedClients = allClients.filter(
      (c) => c.subscribedOrders.includes(order_id) // ИСПРАВЛЕНО
    );

    console.log(
      `Клиенты SERVICE, подписанные на orderId=${order_id}:`,
      subscribedClients
    );

    wss.clients.forEach((client) => {
      const ws = client as WSClient;
      const alreadySubscribed = ws.subscribedOrders?.includes(order_id);
      if (alreadySubscribed) {
        console.log(`Client already subscribed to ${order_id}`);
        // return;
      }

      startRouteForClient(ws, order_id, smoothRoutePoints);
    });
  } catch (error) {
    console.error("Error in route animation:", error);
    throw new Error("Failed to start route animation");
  }
}

export function stopRouteAnimation(order_id: number): void {
  try {
    stopRoute(order_id);
    console.log(`Route animation stopped for order: ${order_id}`);
  } catch (error) {
    console.error(`Error stopping route ${order_id}:`, error);
    throw new Error(`Failed to stop route ${order_id}`);
  }
}

// Вспомогательная функция для получения списка активных маршрутов
export function getActiveRoutes(): number[] {
  return Array.from(wss.clients).reduce((acc: number[], client) => {
    const ws = client as WSClient;
    ws.routeTasks?.forEach((_, orderId) => {
      if (!acc.includes(orderId)) {
        acc.push(orderId);
      }
    });
    return acc;
  }, []);
}

export async function updateRouteSimulation(
  order_id: number,
  settings: Partial<SimulationSettings>
): Promise<void> {
  try {
    updateSimulationSettings(order_id, settings);
    console.log(`Simulation settings updated for order ${order_id}:`, settings);
  } catch (error) {
    console.error(`Error updating simulation ${order_id}:`, error);
    throw new Error(`Failed to update simulation ${order_id}`);
  }
}

export function getRouteSimulationSettings(
  order_id: number
): SimulationSettings | undefined {
  return getSimulationSettings(order_id);
}

export const AllClientsView = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { allClients, subscribedClients } = AllClients();

    res.status(200).json({
      message: "Все клиенты на сокете",
      total: allClients.length,
      subscribed: subscribedClients.length,
      allClients,
      subscribedClients,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
