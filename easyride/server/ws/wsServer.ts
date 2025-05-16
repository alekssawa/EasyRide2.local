// wsServer.ts
import WebSocket, { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({ noServer: true });

export interface WSClient extends WebSocket {
  routeTasks?: Map<number, {
    points: { lat: number; lng: number }[];
    index: number;
    intervalId: NodeJS.Timeout | null;
  }>;
}

// Храним информацию о всех активных маршрутах (ключ - orderId)
const activeRoutes = new Map<number, {
  points: { lat: number; lng: number }[];
  currentIndex: number;
}>();

export function startRouteForClient(
  ws: WSClient,
  orderId: number,
  points: { lat: number; lng: number }[],
  startIndex: number = 0
) {
  // Очищаем старую анимацию для этого orderId, если была
  const existingTask = ws.routeTasks?.get(orderId);
  if (existingTask?.intervalId) {
    clearInterval(existingTask.intervalId);
  }

  let index = startIndex;
  const intervalId = setInterval(() => {
    if (index >= points.length) {
      clearInterval(intervalId);
      ws.routeTasks?.delete(orderId);
      
      // Если больше нет клиентов, получающих этот маршрут, удаляем его из активных
      if (Array.from(wss.clients).every(client => 
        !(client as WSClient).routeTasks?.has(orderId)
      )) {
        activeRoutes.delete(orderId);
      }
      return;
    }
    
    ws.send(JSON.stringify([orderId, points[index]]));
    index++;
    
    // Обновляем текущий индекс для активного маршрута
    const activeRoute = activeRoutes.get(orderId);
    if (activeRoute) {
      activeRoute.currentIndex = index;
    }
  }, 200);

  if (!ws.routeTasks) {
    ws.routeTasks = new Map();
  }
  ws.routeTasks.set(orderId, { points, index, intervalId });
}

wss.on("connection", (ws: WSClient) => {
  console.log("WS client connected");
  
  if (!ws.routeTasks) {
    ws.routeTasks = new Map();
  }

  // Для нового клиента продолжаем все активные маршруты
  activeRoutes.forEach((route, orderId) => {
    startRouteForClient(ws, orderId, route.points, route.currentIndex);
  });

  ws.on("close", () => {
    console.log("WS client disconnected");
    // Очищаем все интервалы для этого клиента
    ws.routeTasks?.forEach(task => {
      if (task.intervalId) clearInterval(task.intervalId);
    });
    ws.routeTasks?.clear();
  });
});

export function getActiveRoute(orderId: number) {
  return activeRoutes.get(orderId);
}

export function setActiveRoute(orderId: number, points: { lat: number; lng: number }[]) {
  activeRoutes.set(orderId, {
    points,
    currentIndex: 0
  });
}

export function clearActiveRoute(orderId: number) {
  activeRoutes.delete(orderId);
}

export function stopRoute(orderId: number) {
  // Удаляем из активных
  activeRoutes.delete(orderId);
  
  // Останавливаем у всех клиентов
  wss.clients.forEach(client => {
    const ws = client as WSClient;
    const task = ws.routeTasks?.get(orderId);
    if (task?.intervalId) {
      clearInterval(task.intervalId);
      ws.routeTasks?.delete(orderId);
    }
  });
}