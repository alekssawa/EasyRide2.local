import axios from "axios";
import { WSClient, wss } from "../ws/wsServer.ts";

interface Point {
  lat: number;
  lng: number;
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
function interpolateRoutePoints(points: Point[], stepMeters: number = 5): Point[] {
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
) {
  // Формируем координаты для OSRM (lng,lat)
  const coords = [driver, from, to]
    .map((c) => `${c.lng},${c.lat}`)
    .join(";");

  const url = `http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  console.log("Starting route animation for order:", order_id);

  const res = await axios.get(url);
  if (!res.data.routes || res.data.routes.length === 0) {
    throw new Error("Маршрут не найден");
  }

  const routeCoords = res.data.routes[0].geometry.coordinates as [number, number][];
  const routePoints = routeCoords.map(([lng, lat]) => ({ lat, lng }));

  // Интерполируем точки маршрута с шагом 5 метров
  const smoothRoutePoints = interpolateRoutePoints(routePoints, 5);

  // Рассылаем маршрут всем подключенным WS клиентам
  wss.clients.forEach((client) => {
    const ws = client as WSClient;

    // Очищаем старую анимацию
    if (ws.routeTask?.intervalId) clearInterval(ws.routeTask.intervalId);

    let index = 0;
    const intervalId = setInterval(() => {
      if (index >= smoothRoutePoints.length) {
        clearInterval(intervalId);
        ws.routeTask = undefined;
        return;
      }
      ws.send(JSON.stringify([order_id, smoothRoutePoints[index]]));
      index++;
    }, 200);

    ws.routeTask = { points: smoothRoutePoints, index, intervalId };
  });
}
