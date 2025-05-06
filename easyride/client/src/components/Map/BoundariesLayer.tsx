import React, { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import { FeatureCollection } from "geojson";

const boroughs = [
  "Khadzhybeiskyi",
  "Kyivskyi",
  "Peresypskyi",
  "Prymorskyi"
  // Добавь сюда другие районы, если нужно
];

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

const BoundariesLayer: React.FC = () => {
  const [data, setData] = useState<FeatureCollection[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoundaries = async () => {
      try {
        const promises = boroughs.map(async (borough) => {
          const res = await fetch(`/data/boundary/${borough}.json`);

          if (!res.ok) {
            throw new Error(`Ошибка загрузки для ${borough}: ${res.statusText}`);
          }

          const json: FeatureCollection = await res.json();
          
          // Фильтруем только геометрии с типом "Polygon" или "MultiPolygon"
          json.features = json.features.filter(feature => 
            feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon"
          );

          return json;
        });

        const boundariesData = await Promise.all(promises);
        setData(boundariesData);
      } catch (error) {
        setError("Ошибка загрузки границ: " + (error instanceof Error ? error.message : error));
        console.error("Ошибка загрузки границ:", error);
      }
    };

    fetchBoundaries();
  }, []);

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      {data.length > 0 ? (
        data.map((boroughData, index) => (
          <GeoJSON
            key={index}
            data={boroughData}
            style={{
              color: getBoroughColor(boroughs[index]),
              weight: 2,
              fillOpacity: 0.4,
            }}
          />
        ))
      ) : (
        !error && <div>Загрузка...</div>
      )}
    </div>
  );
};

export default BoundariesLayer;
