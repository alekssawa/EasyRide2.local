import WebSocket, { WebSocketServer } from "ws";

export const wss = new WebSocketServer({ noServer: true });

export interface WSClient extends WebSocket {
  routeTasks?: Map<
    number,
    {
      points: { lat: number; lng: number }[];
      index: number;
      intervalId: NodeJS.Timeout | null;
      lastUpdateTime?: number;
    }
  >;
}

export interface SimulationSettings {
  isDriving: boolean;
  speed: number; // км/ч
}

export interface ActiveRoute {
  points: { lat: number; lng: number }[];
  currentIndex: number;
  settings: SimulationSettings;
}

// Храним информацию о всех активных маршрутах (ключ - orderId)
const activeRoutes = new Map<number, ActiveRoute>();

export function updateSimulationSettings(
  orderId: number,
  settings: Partial<SimulationSettings>
) {
  const route = activeRoutes.get(orderId);
  if (route) {
    route.settings = {
      ...route.settings,
      ...settings,
    };

    if (settings.speed !== undefined) {
      wss.clients.forEach((client) => {
        const ws = client as WSClient;
        const task = ws.routeTasks?.get(orderId);
        if (task) {
          task.lastUpdateTime = Date.now();
        }
      });
    }
  }
}

export function getSimulationSettings(
  orderId: number
): SimulationSettings | undefined {
  return activeRoutes.get(orderId)?.settings;
}

export function startRouteForClient(
  ws: WSClient,
  orderId: number,
  points: { lat: number; lng: number }[],
  startIndex: number = 0
) {
  const existingTask = ws.routeTasks?.get(orderId);
  if (existingTask?.intervalId) {
    clearInterval(existingTask.intervalId);
  }

  const route = activeRoutes.get(orderId);
  if (!route) {
    console.log(`Route ${orderId} not found in activeRoutes`);
    ws.send(
      JSON.stringify({
        type: "error",
        error: `Route ${orderId} not active`,
      })
    );
    return;
  }

  // Используем переданный startIndex или текущий индекс маршрута
  const actualStartIndex = Math.max(startIndex, route.currentIndex);
  let index = actualStartIndex;
  let lastUpdateTime = Date.now();
  let accumulatedDistance = 0;

  const intervalId = setInterval(() => {
    const now = Date.now();
    const deltaTime = now - lastUpdateTime;
    lastUpdateTime = now;

    if (!route.settings.isDriving) {
      return;
    }

    const speedMps = (route.settings.speed * 1000) / 3600;
    accumulatedDistance += speedMps * (deltaTime / 1000);

    while (index < points.length - 1 && accumulatedDistance > 0) {
      const currentPoint = points[index];
      const nextPoint = points[index + 1];
      const segmentDistance = haversineDistance(currentPoint, nextPoint);

      if (accumulatedDistance >= segmentDistance) {
        accumulatedDistance -= segmentDistance;
        index++;
      } else {
        const fraction = accumulatedDistance / segmentDistance;
        const interpolatedPoint = interpolatePoint(
          currentPoint,
          nextPoint,
          fraction
        );

        ws.send(JSON.stringify([orderId, interpolatedPoint]));
        route.currentIndex = index;
        return;
      }
    }

    if (index >= points.length - 1) {
      clearInterval(intervalId);
      ws.routeTasks?.delete(orderId);
      route.settings.isDriving = false;

      // Отправляем сообщение о завершении маршрута
      ws.send(
        JSON.stringify({
          type: "route_completed",
          orderId,
          completed: true,
          timestamp: Date.now(),
        })
      );

      if (
        Array.from(wss.clients).every(
          (client) => !(client as WSClient).routeTasks?.has(orderId)
        )
      ) {
        activeRoutes.delete(orderId);
      }
      return;
    }

    ws.send(JSON.stringify([orderId, points[index]]));
    route.currentIndex = index;
  }, 50);

  if (!ws.routeTasks) {
    ws.routeTasks = new Map();
  }
  ws.routeTasks.set(orderId, {
    points,
    index,
    intervalId,
    lastUpdateTime,
  });
}

// Функция для расчета расстояния между точками
function haversineDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371000;
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
function interpolatePoint(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
  fraction: number
): { lat: number; lng: number } {
  return {
    lat: p1.lat + (p2.lat - p1.lat) * fraction,
    lng: p1.lng + (p2.lng - p1.lng) * fraction,
  };
}

wss.on("connection", (ws: WSClient) => {
  console.log("WS client connected");

  if (!ws.routeTasks) {
    ws.routeTasks = new Map();
  }

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("Received message:", data);

      if (data.type === "subscribe" && data.orderID) {
        const orderId = Number(data.orderID);
        const route = activeRoutes.get(orderId);

        if (route) {
          startRouteForClient(ws, orderId, route.points, route.currentIndex);
          ws.send(
            JSON.stringify({
              type: "subscribed",
              orderID: orderId,
              currentIndex: route.currentIndex,
            })
          );
        } else {
          ws.send(
            JSON.stringify({
              type: "error",
              error: `Route ${orderId} not active`,
            })
          );
        }
      }
    } catch (e) {
      console.error("Error processing WS message:", e);
    }
  });

  // Для нового клиента продолжаем все активные маршруты
  // с их текущей позиции
  activeRoutes.forEach((route, orderId) => {
    startRouteForClient(ws, orderId, route.points, route.currentIndex);
  });

  ws.on("close", () => {
    console.log("WS client disconnected");
    // Очищаем все интервалы для этого клиента
    ws.routeTasks?.forEach((task) => {
      if (task.intervalId) clearInterval(task.intervalId);
    });
    ws.routeTasks?.clear();
  });
});

export function getActiveRoute(orderId: number) {
  return activeRoutes.get(orderId);
}

export function setActiveRoute(
  orderId: number,
  points: { lat: number; lng: number }[]
) {
  activeRoutes.set(orderId, {
    points,
    currentIndex: 0,
    settings: {
      isDriving: false, // По умолчанию водитель не едет
      speed: 40, // Средняя скорость по умолчанию (км/ч)
    },
  });
}

export function clearActiveRoute(orderId: number) {
  activeRoutes.delete(orderId);
}

export function stopRoute(orderId: number) {
  // Удаляем из активных
  activeRoutes.delete(orderId);

  // Останавливаем у всех клиентов
  wss.clients.forEach((client) => {
    const ws = client as WSClient;
    const task = ws.routeTasks?.get(orderId);
    if (task?.intervalId) {
      clearInterval(task.intervalId);
      ws.routeTasks?.delete(orderId);
    }
  });
}

export function getActiveRoutes(): number[] {
  return Array.from(activeRoutes.keys());
}
