import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Чтобы маркер нормально отображался
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIconRetinaUrl,
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
  });

interface MapViewProps {
  /** Любая строка-адрес, понятная Nominatim */
  address: string;
  /** Уровень приближения, по умолчанию 13 */
  zoom?: number;
  /** Высота контейнера карты, по умолчанию 400px */
  height?: string;
}

const MapView: React.FC<MapViewProps> = ({
  address,
  zoom = 13,
  height = '400px',
}) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoords() {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            address
          )}`
        );
        const data = await res.json();
        if (data.length === 0) {
          setError('Адрес не найден');
        } else {
          setPosition([
            parseFloat(data[0].lat),
            parseFloat(data[0].lon),
          ]);
        }
      } catch (e) {
        console.error(e);
        setError('Ошибка геокодирования');
      }
    }
    fetchCoords();
  }, [address]);

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }
  if (!position) {
    return <div className="p-4">Загрузка карты…</div>;
  }

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{address}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;
