import WebSocket, { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({ noServer: true });

export interface WSClient extends WebSocket {
  routeTask?: {
    points: { lat: number; lng: number }[];
    index: number;
    intervalId: NodeJS.Timeout | null;
  };
}

wss.on("connection", (ws: WSClient) => {
  console.log("WS client connected");

  ws.on("close", () => {
    console.log("WS client disconnected");
    if (ws.routeTask?.intervalId) clearInterval(ws.routeTask.intervalId);
  });
});
