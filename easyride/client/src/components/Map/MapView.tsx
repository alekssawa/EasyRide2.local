// components/Map/MapView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface IconDefaultPrototype {
  _getIconUrl?: () => string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name?: string;
}

delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetinaUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

interface MapViewProps {
  address: string;
  zoom?: number;
}

const MapView: React.FC<MapViewProps> = ({ address, zoom = 13 }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    async function fetchCoords() {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
        );
        const data = (await res.json()) as NominatimResult[];

        if (data.length === 0) {
          setError('Адрес не найден');
        } else {
          const newPosition = [
            parseFloat(data[0].lat),
            parseFloat(data[0].lon),
          ] as [number, number];
          setPosition(newPosition);

          if (mapRef.current) {
            mapRef.current.flyTo(newPosition, zoom);
          }
        }
      } catch (e) {
        console.error(e);
        setError('Ошибка геокодирования');
      }
    }

    fetchCoords();
  }, [address, zoom]);

  useEffect(() => {
    if (mapRef.current && position) {
      const timer = setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [position]);

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!position) return <div className="p-4">Загрузка карты…</div>;

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      ref={mapRef}
      whenReady={() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }}
      className="h-full w-full"
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
      zoomControl={false}
      dragging={false}
      doubleClickZoom={false}
    >
      <TileLayer
        attribution="EasyRide"  // Пустая строка вместо стандартной атрибуции
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>{address}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;