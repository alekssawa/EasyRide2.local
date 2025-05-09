import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface RoutingProps {
  from: [number, number];
  to: [number, number];
  drivers: DriverWithCoordinates[];
  selectedTariff: string | null;
  map: L.Map;
}

interface DriverWithCoordinates {
  id: string;
  tariff: string;
  coordinates: [number, number];
  borough: string;
}

const findNearestDriver = (
  from: [number, number],
  drivers: DriverWithCoordinates[],
  selectedTariff: string | null
): DriverWithCoordinates | null => {
  let minDistance = Infinity;
  let nearestDriver: DriverWithCoordinates | null = null;

  const filteredDrivers = selectedTariff
    ? drivers.filter((driver) => driver.tariff === selectedTariff)
    : drivers;

  for (const driver of filteredDrivers) {
    const dist = Math.hypot(
      driver.coordinates[1] - from[0],
      driver.coordinates[0] - from[1]
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearestDriver = driver;
    }
  }

  return nearestDriver;
};

const Routing: React.FC<RoutingProps> = ({ from, to, drivers, selectedTariff, map }) => {
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    const nearestDriver = findNearestDriver(from, drivers, selectedTariff);

    if (routingControlRef.current) {
      routingControlRef.current.remove();
    }

    const routePoints = [];

    if (nearestDriver) {
      routePoints.push(L.latLng(from[0], from[1]));
      routePoints.push(L.latLng(nearestDriver.coordinates[1], nearestDriver.coordinates[0]));
      routePoints.push(L.latLng(to[0], to[1]));
    }

    if (routePoints.length > 0) {
      routingControlRef.current = L.Routing.control({
        waypoints: routePoints,
        lineOptions: {
          styles: [{ color: "purple", weight: 4 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
        addWaypoints: false,
        fitSelectedRoutes: true,
        plan: L.Routing.plan(routePoints, {
          draggableWaypoints: false,
          addWaypoints: false,
          createMarker: () => false,
        }),
      }).addTo(map);
    }

    return () => {
      if (routingControlRef.current) {
        routingControlRef.current.remove();
      }
    };
  }, [from, to, drivers, selectedTariff, map]);

  return null;
};

export default Routing;