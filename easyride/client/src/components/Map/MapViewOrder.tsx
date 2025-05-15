import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
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
  orderID: number; // добавляем orderID для фильтрации сообщений по заказу
}

interface ExtendedRoute extends L.Routing.IRoute {
  waypointIndices: number[];
}

const DriverRoutingMap = ({ driver, from, to, orderID }: MapProps) => {
  const map = useMap();
  const routingControlRef = useRef<{
    control: L.Routing.Control;
    lines: L.Polyline[];
  } | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  // Локальный стейт для координат водителя, которые обновляются из WS
  const [driverPosition, setDriverPosition] = useState<Point>(driver);

  useEffect(() => {
    // WebSocket
    const ws = new WebSocket("ws://localhost:5000");

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data);

        if (
          Array.isArray(data) &&
          data.length === 2 &&
          typeof data[0] === "string" && // т.к. "170" — строка
          typeof data[1] === "object" &&
          data[1] !== null
        ) {
          const incomingOrderID = parseInt(data[0], 10); // преобразуем в число
          const coords = data[1] as Point;

          if (incomingOrderID === orderID) {
            setDriverPosition({ lat: coords.lat, lng: coords.lng });
          }
        }
      } catch (e) {
        console.error("Error parsing WS message", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [orderID]);

  useEffect(() => {
    const driverIcon = L.icon({
      iconUrl: markerCarImage,
      iconSize: [128 / 4, 160 / 4],
      iconAnchor: [64 / 4, 80 / 4],
    });

    const driverMarker = L.marker([driverPosition.lat, driverPosition.lng], {
      icon: driverIcon,
    }).addTo(map);
    const fromMarker = L.marker([from.lat, from.lng]).addTo(map);
    const toMarker = L.marker([to.lat, to.lng]).addTo(map);

    driverMarkerRef.current = driverMarker;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(driverPosition.lat, driverPosition.lng),
        L.latLng(from.lat, from.lng),
        L.latLng(to.lat, to.lng),
      ],
      createMarker: () => null,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      show: false,
      collapsible: false,
    } as unknown as L.Routing.RoutingControlOptions);

    // 🔥 Добавляем routingControl на карту до route()
    routingControl.addTo(map);

    routingControl.on("routesfound", (e: unknown) => {
      const event = e as { routes: ExtendedRoute[] };
      const route = event.routes[0];

      if (!route || !route.coordinates || !route.waypointIndices) return;

      const { coordinates, waypointIndices } = route;

      const indexFrom = waypointIndices[1];
      const part1 = coordinates.slice(0, indexFrom + 1);
      const part2 = coordinates.slice(indexFrom);

      const line1 = L.polyline(part1, {
        color: "#007bff",
        weight: 8,
        opacity: 0.6,
      }).addTo(map);
      const line2 = L.polyline(part2, {
        color: "#28a745",
        weight: 4,
        opacity: 1,
      }).addTo(map);

      const bounds = L.latLngBounds([...part1, ...part2]);
      map.fitBounds(bounds, { padding: [20, 20] });

      routingControlRef.current = {
        control: routingControl,
        lines: [line1, line2],
      };
    });

    routingControl.route(); // теперь можно вызывать

    return () => {
      map.removeLayer(driverMarker);
      map.removeLayer(fromMarker);
      map.removeLayer(toMarker);
      if (routingControlRef.current?.lines) {
        routingControlRef.current.lines.forEach((line) =>
          map.removeLayer(line)
        );
      }
      if (routingControlRef.current?.control) {
        map.removeControl(routingControlRef.current.control);
      }
    };
  }, [driverPosition, from, to, map]);

  return null;
};

const MapWrapper = ({ driver, from, to, orderID }: MapProps) => {
  return (
    <MapContainer
      center={[from.lat, from.lng]}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
      doubleClickZoom={false}
      zoomControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <DriverRoutingMap driver={driver} from={from} to={to} orderID={orderID} />
    </MapContainer>
  );
};

export default MapWrapper;
