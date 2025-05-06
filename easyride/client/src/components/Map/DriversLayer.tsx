import React, { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

import markerCarImage from "../../assets/img/MarkerCar.png";

interface Driver {
  id: number;
  tariff: string;
}

interface DriverWithCoordinates extends Driver {
  coordinates: [number, number];
  borough: string;
}

const DriversLayer: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverWithCoordinates[]>([]);
  const [error, setError] = useState<string | null>(null);

  interface RoadProperties {
    name?: string;
    type?: string;
    length?: number;
  }
  
  interface GeoJsonFeature {
    type: "Feature";
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
    properties: RoadProperties;
  }
  
  const loadRoads = async (borough: string): Promise<GeoJsonFeature[]> => {
    try {
      const res = await fetch(`/data/roads/${borough}_Roads.json`);
      const data = await res.json();
      return (data.features as GeoJsonFeature[]).filter(
        (f) => f.geometry.type === "LineString"
      );
    } catch {
      return [];
    }
  };
  
  const placeDriverOnRoads = (roads: GeoJsonFeature[]): [number, number] => {
    const road = roads[Math.floor(Math.random() * roads.length)];
    const coords = road.geometry.coordinates;
    return coords[Math.floor(Math.random() * coords.length)];
  };

  useEffect(() => {
    const distributeDrivers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/order/getFreeDrivers");
        const driversData: Driver[] = await res.json();

        if (!driversData || driversData.length === 0) {
          setError("Нет свободных водителей.");
          return;
        }

        const boroughs = ["Khadzhybeiskyi", "Kyivskyi", "Peresypskyi", "Prymorskyi"];
        let boroughIndex = 0;
        const result: DriverWithCoordinates[] = [];

        for (const driver of driversData) {
          const borough = boroughs[boroughIndex];
          const roads = await loadRoads(borough);

          if (roads.length === 0) continue;

          const point = placeDriverOnRoads(roads);

          result.push({
            id: driver.id,
            tariff: driver.tariff,
            coordinates: point,
            borough,
          });

          boroughIndex = (boroughIndex + 1) % boroughs.length;
        }

        setDrivers(result);
      } catch (err) {
        console.error(err);
        setError("Ошибка при получении водителей.");
      }
    };

    distributeDrivers();
  }, []);

  const getIcon = () =>
    L.icon({
        iconUrl: markerCarImage,  // Путь к изображению
        iconSize: [128/4, 160/4], // Оригинальный размер иконки
        iconAnchor: [64/4, 80/4], // Точка, в которой иконка будет привязана к карте (центр изображения)
        popupAnchor: [0, -80/4], // Расположение всплывающего окна
      });

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <>
      {drivers.map((driver) => (
        <Marker
          key={driver.id}
          position={[driver.coordinates[1], driver.coordinates[0]]}
          icon={getIcon()}
        >
          <Popup>
            <b>ID:</b> {driver.id}
            <br />
            <b>Тариф:</b> {driver.tariff}
            <br />
            <b>Район:</b> {driver.borough}
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default DriversLayer;
