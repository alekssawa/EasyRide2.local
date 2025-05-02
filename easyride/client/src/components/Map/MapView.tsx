import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

interface DriverWithCoordinates {
  id: string;
  tariff: string;
  coordinates: [number, number];
  borough: string; // Добавлено поле для района
}
interface Geometry {
  type: string;
  coordinates: [[number, number][]]; // для многоугольников
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
  coordinates: [number, number][];
}

const boroughs = ["Khadzhybeiskyi", "Kyivskyi", "Peresypskyi", "Prymorskyi"];

const getIcon = () => {
  return new L.Icon({
    iconUrl: markerCarImage,  // Путь к изображению
    iconSize: [128/4, 160/4], // Оригинальный размер иконки
    iconAnchor: [64/4, 80/4], // Точка, в которой иконка будет привязана к карте (центр изображения)
    popupAnchor: [0, -80/4], // Расположение всплывающего окна
  });
};

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

const loadRoads = async (borough: string): Promise<Road[]> => {
  try {
    const res = await fetch(`/data/roads/${borough}_Roads.json`);
    const data = await res.json();
    const roads = (data.features as Feature[]).filter(
      (feature) => feature.geometry.type === "LineString"
    );
    return roads;
  } catch (err) {
    console.error("Ошибка в loadRoads:", err);
    return [];
  }
};

const placeDriverOnRoads = (roads: Road[]): [number, number] => {
  // Выбираем случайную дорогу
  const road = roads[Math.floor(Math.random() * roads.length)];
  const coords = road.geometry.coordinates;

  // Проверка на случай, если координат в массиве меньше одного
  if (coords.length < 1) {
    throw new Error("Недостаточно координат на дороге");
  }

  // Выбираем случайную точку из координат
  const point = coords[Math.floor(Math.random() * coords.length)];

  // Убеждаемся, что точка представляет собой пару координат
  if (Array.isArray(point) && point.length === 2) {
    // Тип point точно [number, number], так как мы это проверяем
    return point as unknown as [number, number];
  } else {
    throw new Error("Некорректная координата");
  }
};

const MapView: React.FC = () => {
  const [driversWithCoords, setDriversWithCoords] = useState<
    DriverWithCoordinates[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);

  useEffect(() => {
    loadBoundaries(setBoundaries);
  }, []);

  useEffect(() => {
    const distributeDrivers = async () => {
      try {
        const driverRes = await fetch(
          "http://localhost:5000/api/order/getFreeDrivers"
        );
        const drivers: DriverWithCoordinates[] = await driverRes.json();

        console.log(drivers);

        if (!drivers || drivers.length === 0) {
          setError("Нет свободных водителей.");
          return;
        }

        const allDriversWithCoords: DriverWithCoordinates[] = [];

        // Пример: Для каждого водителя назначаем район один раз
        let boroughIndex = 0; // Индекс для района

        for (const driver of drivers) {
          const borough = boroughs[boroughIndex];
          const roads = await loadRoads(borough);

          if (!roads || roads.length === 0) {
            console.warn(`Нет дорог для района ${borough}`);
            continue;
          }

          const point = placeDriverOnRoads(roads);
          allDriversWithCoords.push({
            id: driver.id,
            tariff: driver.tariff,
            coordinates: point,
            borough: borough, // Присваиваем район водителю
          });

          // Перемещаемся к следующему району для следующего водителя
          boroughIndex = (boroughIndex + 1) % boroughs.length;
        }

        setDriversWithCoords(allDriversWithCoords);
      } catch (err) {
        setError("Ошибка распределения водителей.");
        console.error("Ошибка распределения водителей:", err);
      }
    };

    distributeDrivers();
  }, [boundaries]); // Обновляем только когда загрузятся границы

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  console.log(driversWithCoords);

  return (
    <div style={{ height: "500px" }}>
      <MapContainer
        center={[46.4825, 30.7326]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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

        {driversWithCoords.map((driver, index) => {
          return (
            <Marker
              key={`${driver.id}-${index}`}
              position={[driver.coordinates[1], driver.coordinates[0]]}
              icon={getIcon()} // Получаем иконку с изображением
            >
              <Popup>
                {driver.id} - {driver.tariff}
                <br />
                Район: {driver.borough}
                <br />
                Координаты: {driver.coordinates[1]}, {driver.coordinates[0]}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
