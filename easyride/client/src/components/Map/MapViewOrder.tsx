import { useEffect, useRef, useState } from "react";
import L from "leaflet";

declare module "leaflet" {
  interface Marker {
    slideTo(
      latlng: L.LatLng,
      options?: {
        duration?: number;
        keepAtCenter?: boolean;
        easeLinearity?: number;
      }
    ): this;
  }
}
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "leaflet.marker.slideto";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

import markerCarImage from "../../assets/img/MarkerCar.png";

interface Point {
  lat: number;
  lng: number;
}

interface MapProps {
  driver: Point;
  from: Point;
  to: Point;
  orderID: number;
  onWaitingDriverFinish?: () => void;
  onRouteCompleted?: () => void;
}

interface ExtendedRoute extends L.Routing.IRoute {
  waypointIndices: number[];
}

const DriverRoutingMap = ({
  driver,
  from,
  to,
  orderID,
  onWaitingDriverFinish,
  onRouteCompleted,
}: MapProps) => {
  const map = useMap();
  const routingControlRef = useRef<{
    control: L.Routing.Control;
    lines: L.Polyline[];
  } | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  const [driverPosition, setDriverPosition] = useState<Point>(driver);
  const [wsInstance, setWsInstance] = useState<WebSocket | null>(null);
  // const [routeStatus, setRouteStatus] = useState<{
  //   completed: boolean;
  //   completionTime?: number;
  // }>({ completed: false });

  // useEffect(() => {
  //   console.log(routeStatus);
  // }, [routeStatus]);

  useEffect(() => {
    console.log("onRouteCompleted в эффекте:", onRouteCompleted);
    // ... остальной код
  }, [orderID, onRouteCompleted]);

  // Анимация движения маркера
  useEffect(() => {
    if (!driverMarkerRef.current) return;

    const marker = driverMarkerRef.current;
    const newLatLng = L.latLng(driverPosition.lat, driverPosition.lng);

    marker.slideTo(newLatLng, {
      duration: 200,
      keepAtCenter: false,
    });
  }, [driverPosition]);

  useEffect(() => {
    let isMounted = true;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      if (wsInstance) {
        const state = wsInstance.readyState;
        if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
          return; // Уже подключен или в процессе подключения
        }
      }

      const ws = new WebSocket("ws://localhost:5000");
      setWsInstance(ws);

      ws.onopen = () => {
        if (!isMounted) {
          ws.close();
          return;
        }
        reconnectAttempts = 0;
        // setIsConnected(true);
        ws.send(JSON.stringify({ type: "subscribe", orderID }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // console.log("Received:", data);

          if (data.type === "error") {
            console.error("Server error:", data.error);
            return;
          }

          if (data.type === "subscribed") {
            console.log("Received:", data)
            console.log("Successfully subscribed to order:", data.orderID);
            return;
          }
          // console.log(orderID,data.orderId)

          if (data.type === "waiting_driver_finish" && isMounted && Number(data.orderId) === orderID) {
            console.log("Received:", data)
            console.log(orderID,data.orderId)
            // console.log("onWaitingDriverFinish")
            onWaitingDriverFinish?.()
            // console.log("onWaitingDriverFinish2")
          }

          if (data.type === "test" && isMounted && Number(data.orderId) === orderID) {
            console.log("Received:", data)
            console.log(orderID,data.orderId)
            // console.log("test")
            onWaitingDriverFinish?.()
            // console.log("test")
          }

          if (data.type === "driver_completed_ride" /*&& isMounted*/ && Number(data.orderId) === orderID) {
            console.log("Received:", data)
            // console.log(orderID,data.orderId)
            // console.log("onRouteCompleted")
            onRouteCompleted?.();
            // console.log("onRouteCompleted2")
          }

          if (Array.isArray(data) && data.length === 2) {
            const [incomingOrderID, coords] = data;
            if (
              parseInt(incomingOrderID, 10) === orderID &&
              typeof coords?.lat === "number" &&
              typeof coords?.lng === "number"
            ) {
              setDriverPosition(coords);
            }
          }
        } catch (e) {
          console.error("Parse error:", e);
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        // setIsConnected(false);
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = Math.min(5000 * reconnectAttempts, 30000);
          reconnectTimeout = setTimeout(connect, delay);
        }
      };

      ws.onerror = (error) => {
        if (!isMounted) return;
        console.error("WebSocket error:", error);
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (wsInstance) {
        wsInstance.close();
        setWsInstance(null);
      }
    };
  }, [orderID, onWaitingDriverFinish, onRouteCompleted]);

  // Инициализация маршрута и маркеров
  useEffect(() => {
    if (!map) return;

    // Создаем иконку для машины
    const driverIcon = L.icon({
      iconUrl: markerCarImage,
      iconSize: [128 / 4, 160 / 4],
      iconAnchor: [64 / 4, 80 / 4],
    });

    // Создаем маркеры
    const driverMarker = L.marker([driver.lat, driver.lng], {
      icon: driverIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    const fromMarker = L.marker([from.lat, from.lng], {
      icon: L.icon({
        iconUrl:
          "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    }).addTo(map);

    const toMarker = L.marker([to.lat, to.lng], {
      icon: L.icon({
        iconUrl:
          "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    }).addTo(map);

    driverMarkerRef.current = driverMarker;

    // Настройка маршрутизации
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(driver.lat, driver.lng),
        L.latLng(from.lat, from.lng),
        L.latLng(to.lat, to.lng),
      ],
      createMarker: () => null,
      addWaypoints: false,
      addToMap: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      show: false,
      routeWhileDragging: false,
      showAlternatives: false,
      collapsible: false,
      lineOptions: {
        // Добавляем это
        styles: [
          {
            // Явно указываем пустые стили
            color: "transparent",
            opacity: 0,
            weight: 0,
          },
        ],
      },
    } as unknown as L.Routing.RoutingControlOptions);

    // routingControl.addTo(map);

    routingControl.on("routesfound", (e) => {
      const event = e as { routes: ExtendedRoute[] };
      const route = event.routes[0];

      if (!route || !route.coordinates || !route.waypointIndices) return;

      const { coordinates, waypointIndices } = route;

      // Удаляем старые линии, если они есть
      if (routingControlRef.current?.lines) {
        routingControlRef.current.lines.forEach((line) => {
          if (line && map.hasLayer(line)) {
            map.removeLayer(line);
          }
        });
      }

      const part1 = coordinates.slice(
        waypointIndices[0],
        waypointIndices[1] + 1
      );
      const part2 = coordinates.slice(
        waypointIndices[1],
        waypointIndices[2] + 1
      );

      const svgRenderer = L.svg({ padding: 1 });

      const line1 = L.polyline(part1, {
        color: "#007bff",
        weight: 6,
        opacity: 0.8,
        lineJoin: "round",
        lineCap: "round",
        renderer: svgRenderer,
      }).addTo(map);

      const line2 = L.polyline(part2, {
        color: "green",
        weight: 4,
        opacity: 1,
        lineJoin: "round",
        lineCap: "round",
        renderer: svgRenderer,
      }).addTo(map);

      // Обновляем границы карты
      const bounds = L.latLngBounds([...part1, ...part2]);
      map.fitBounds(bounds, { padding: [50, 50] });

      routingControlRef.current = {
        control: routingControl,
        lines: [line1, line2],
      };
    });

    routingControl.route();

    return () => {
      // Очистка при размонтировании
      map.removeLayer(driverMarker);
      map.removeLayer(fromMarker);
      map.removeLayer(toMarker);

      if (routingControlRef.current) {
        routingControlRef.current.lines?.forEach((line) =>
          map.removeLayer(line)
        );
        map.removeControl(routingControlRef.current.control);
      }
    };
  }, [map, from, to, driver]);

  return null;
};

const MapWrapper = ({
  driver,
  from,
  to,
  orderID,
  onWaitingDriverFinish,
  onRouteCompleted,
}: MapProps) => {
  return (
    <MapContainer
      center={[from.lat, from.lng]}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
      doubleClickZoom={false}
      zoomControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <DriverRoutingMap
        driver={driver}
        from={from}
        to={to}
        orderID={orderID}
        onWaitingDriverFinish = {onWaitingDriverFinish}
        onRouteCompleted={onRouteCompleted}
      />
    </MapContainer>
  );
};

export default MapWrapper;
