import axios from "axios";
import { WSClient, wss } from "../ws/wsServer.ts";

export async function startRouteAnimation(order_id: number, driver: { lat: number; lng: number }, from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  // Формируем координаты для OSRM (lng,lat)
  const coords = [driver, from, to]
    .map((c) => `${c.lng},${c.lat}`)
    .join(";");

  const url = `http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  console.log(order_id)

  const res = await axios.get(url);
  if (!res.data.routes || res.data.routes.length === 0) {
    throw new Error("Маршрут не найден");
  }

  const routeCoords = res.data.routes[0].geometry.coordinates as [number, number][];
  const routePoints = routeCoords.map(([lng, lat]) => ({ lat, lng }));

  // Рассылаем маршрут всем подключенным WS клиентам
  wss.clients.forEach((client) => {
    const ws = client as WSClient;

    // Очищаем старую анимацию
    if (ws.routeTask?.intervalId) clearInterval(ws.routeTask.intervalId);

    let index = 0;
    const intervalId = setInterval(() => {
      if (index >= routePoints.length) {
        clearInterval(intervalId);
        ws.routeTask = undefined;
        return;
      }
      ws.send(JSON.stringify([order_id, routePoints[index]]));
      index++;
    }, 1000);

    ws.routeTask = { points: routePoints, index, intervalId };
  });
}
