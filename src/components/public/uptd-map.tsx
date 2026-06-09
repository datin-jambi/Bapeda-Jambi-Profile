"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by webpack
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type UptdMarker = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  district: string | null;
  province: string | null;
  latitude: number;
  longitude: number;
  googleMapsUrl: string | null;
};

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

interface UptdMapProps {
  markers: UptdMarker[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

// Jambi province center
const JAMBI_CENTER: [number, number] = [-1.6101, 103.6131];

export function UptdMap({ markers, selectedId, onSelect }: UptdMapProps) {
  const selected = markers.find((m) => m.id === selectedId);
  const flyTarget: [number, number] = selected
    ? [selected.latitude, selected.longitude]
    : JAMBI_CENTER;
  const flyZoom = selected ? 15 : 8;

  return (
    <MapContainer
      center={JAMBI_CENTER}
      zoom={8}
      className="w-full h-full rounded-lg z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo center={flyTarget} zoom={flyZoom} />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.latitude, m.longitude]}
          icon={icon}
          eventHandlers={{ click: () => onSelect(m.id) }}
        >
          <Popup maxWidth={280}>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-base leading-tight">{m.name}</p>
              {m.address && <p className="text-gray-600">{m.address}</p>}
              {m.phone && (
                <p className="text-gray-600">
                  <span className="font-medium">Telp:</span> {m.phone}
                </p>
              )}
              {m.email && (
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {m.email}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                {m.googleMapsUrl && (
                  <a
                    href={m.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Google Maps
                  </a>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
