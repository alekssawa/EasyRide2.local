import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import markerCarImage from "../../assets/img/MarkerCar.png";

const getBoroughColor = (borough: string) => {
  switch (borough) {
    case "Khadzhybeiskyi":
      return "red";
    case "Kyivskyi":
      return "green";
    case "Peresypskyi":
      return "blue";
    case "Prymorskyi":
      return "orange";
    default:
      return "gray";
  }
};

interface MapViewProps {
  fromSuggestions: { lat: number; lon: number; display_name: string }[]; // Add fromSuggestions
  toSuggestions: { lat: number; lon: number; display_name: string }[];     // Add toSuggestions
  zoom: number;
  selectedTariff: string | null;
  searchTriggered: boolean; // ✅ добавлено
  setSearchTriggered: React.Dispatch<React.SetStateAction<boolean>>;
}

interface DriverWithCoordinates {
  id: string;
  tariff: string;
  coordinates: [number, number];
  borough: string;
}

interface Geometry {
  type: string;
  coordinates: [[number, number][]];
}

interface Feature {
  geometry: Geometry;
  id: string;
}

interface Road {
  geometry: Geometry;
  id: string;
}

interface Boundary {
  borough: string;
  coordinates: [number, number][]; // Используем тип координат
}

const boroughs = ["Khadzhybeiskyi", "Kyivskyi", "Peresypskyi", "Prymorskyi"];

const getCarIcon = () => {
  return new L.Icon({
    iconUrl: markerCarImage,
    iconSize: [128 / 4, 160 / 4],
    iconAnchor: [64 / 4, 80 / 4],
    popupAnchor: [0, -80 / 4],
  });
};

// Стандартная иконка для точек "from" и "to"
const getDefaultIcon = () => {
  return new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  });
};

// Загрузка границ для районов
const loadBoundaries = async (
  setBoundaries: React.Dispatch<React.SetStateAction<Boundary[]>>
) => {
  try {
    const promises = boroughs.map(async (borough) => {
      const res = await fetch(`/data/boundary/${borough}.json`);
      const data = await res.json();
      const feature = data.features[0];
      const coordinates = feature.geometry.coordinates[0];
      const latLngCoords: [number, number][] = coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );
      return { borough, coordinates: latLngCoords };
    });

    const loadedBoundaries = await Promise.all(promises);
    setBoundaries(loadedBoundaries);
  } catch (err) {
    console.error("Ошибка загрузки boundaries:", err);
  }
};

// Загрузка всех дорог для всех районов
const loadAllRoads = async (): Promise<Record<string, Road[]>> => {
  try {
    const roadsData = await Promise.all(
      boroughs.map(async (borough) => {
        const res = await fetch(`/data/roads/${borough}_Roads.json`);
        const data = await res.json();
        const roads = (data.features as Feature[]).filter(
          (feature) => feature.geometry.type === "LineString"
        );
        return { borough, roads };
      })
    );

    const roadsByBorough = roadsData.reduce((acc, { borough, roads }) => {
      acc[borough] = roads;
      return acc;
    }, {} as Record<string, Road[]>);

    return roadsByBorough;
  } catch (err) {
    console.error("Ошибка в loadAllRoads:", err);
    return {};
  }
};

// Распределение водителей по дорогам
const placeDriverOnRoads = (roads: Road[]): [number, number] => {
  const road = roads[Math.floor(Math.random() * roads.length)];
  const coords = road.geometry.coordinates;

  if (coords.length < 1) {
    throw new Error("Недостаточно координат на дороге");
  }

  const point = coords[Math.floor(Math.random() * coords.length)];

  if (Array.isArray(point) && point.length === 2) {
    return point as unknown as [number, number];
  } else {
    throw new Error("Некорректная координата");
  }
};

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

const MapView: React.FC<MapViewProps> = ({
  fromSuggestions,
  toSuggestions,
  zoom,
  selectedTariff,
  searchTriggered,
  setSearchTriggered,
}) => {
  const [driversWithCoords, setDriversWithCoords] = useState<DriverWithCoordinates[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [roadsData, setRoadsData] = useState<Record<string, Road[]>>({});

  const routingControlRef = useRef<L.Routing.Control | null>(null); // Ссылка на маршрут

  const map = useMap(); // Получаем объект карты через useMap внутри компонента

  useEffect(() => {
    loadBoundaries(setBoundaries);
    loadAllRoads().then(setRoadsData); // Загружаем все дороги для всех районов
  }, []);

  useEffect(() => {
    const distributeDrivers = async () => {
      try {
        const driverRes = await fetch("http://localhost:5000/api/order/getFreeDrivers");
        const drivers: DriverWithCoordinates[] = await driverRes.json();

        if (!drivers || drivers.length === 0) {
          setError("Нет свободных водителей.");
          return;
        }

        const allDriversWithCoords: DriverWithCoordinates[] = [];
        let boroughIndex = 0;

        for (const driver of drivers) {
          const borough = boroughs[boroughIndex];
          const roads = roadsData[borough];

          if (!roads || roads.length === 0) {
            console.warn(`Нет дорог для района ${borough}`);
            continue;
          }

          const point = placeDriverOnRoads(roads);
          allDriversWithCoords.push({
            id: driver.id,
            tariff: driver.tariff,
            coordinates: point,
            borough: borough,
          });

          boroughIndex = (boroughIndex + 1) % boroughs.length;
        }

        setDriversWithCoords(allDriversWithCoords);
      } catch (err) {
        setError("Ошибка распределения водителей.");
        console.error("Ошибка распределения водителей:", err);
      }
    };

    if (Object.keys(roadsData).length > 0) {
      distributeDrivers();
    }
  }, [roadsData]);

  useEffect(() => {
    if (
      searchTriggered && // ✅ добавлено
      fromSuggestions.length > 0 &&
      toSuggestions.length > 0 &&
      driversWithCoords.length > 0 &&
      map
    ) {
      console.log("nearestDriver");

      const from = [fromSuggestions[0].lat, fromSuggestions[0].lon] as [number, number];
      const to = [toSuggestions[0].lat, toSuggestions[0].lon] as [number, number];

      const nearestDriver = findNearestDriver(from, driversWithCoords, selectedTariff);

      if (routingControlRef.current) {
        routingControlRef.current.remove(); // Удаляем старый маршрут
      }

      const routePoints = [];

      if (nearestDriver) {
        routePoints.push(L.latLng(from[0], from[1]));
        routePoints.push(L.latLng(nearestDriver.coordinates[1], nearestDriver.coordinates[0]));
        routePoints.push(L.latLng(to[0], to[1]));
      }

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
          createMarker: () => false, // Не создавать маркеры
        }),
      }).addTo(map);

      setSearchTriggered(false); // ✅ сбрасываем, чтобы можно было искать повторно
    }
    else {
      console.log("fail nearestDriver");
    }
  }, [
    searchTriggered, // ✅ добавлено в зависимости
    fromSuggestions,
    toSuggestions,
    driversWithCoords,
    selectedTariff,
    setSearchTriggered,
    map, // добавили зависимость от map
  ]);

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div style={{ height: "500px" }}>
      {/* {fromSuggestions.length === 0 && (
        <div>Нет предложений для маршрута от.</div>
      )}
      {toSuggestions.length === 0 && (
        <div>Нет предложений для маршрута до.</div>
      )} */}

      <MapContainer
        center={[46.4825, 30.7326]}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {fromSuggestions.map((suggestion, index) => (
          <Marker
            key={`from-${index}`}
            position={[suggestion.lat, suggestion.lon]}
            icon={getDefaultIcon()} // Стандартная иконка
          >
            <Popup>{suggestion.display_name}</Popup>
          </Marker>
        ))}

        {toSuggestions.map((suggestion, index) => (
          <Marker
            key={`to-${index}`}
            position={[suggestion.lat, suggestion.lon]}
            icon={getDefaultIcon()} // Стандартная иконка
          >
            <Popup>{suggestion.display_name}</Popup>
          </Marker>
        ))}

        {boundaries.map((boundary) => (
          <Polygon
            key={boundary.borough}
            positions={boundary.coordinates}
            pathOptions={{
              color: getBoroughColor(boundary.borough),
              weight: 2,
              fillOpacity: 0.1,
            }}
          />
        ))}

        {driversWithCoords.map((driver) => (
          <Marker
            key={driver.id}
            position={[driver.coordinates[1], driver.coordinates[0]]} // Учитываем правильный порядок координат
            icon={getCarIcon()} // Используем иконку водителя
          >
            <Popup>
              {`ID: ${driver.id}, Тариф: ${driver.tariff}, Район: ${driver.borough}`}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
