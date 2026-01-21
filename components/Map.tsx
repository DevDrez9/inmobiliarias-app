'use client'

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState } from 'react'

// Fix Default Icon issues in Next.js + Leaflet
// We check window to avoid SSR errors, though 'use client' helps
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

import { useMap } from 'react-leaflet'

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap()
    useEffect(() => {
        map.flyTo(center, zoom)
    }, [center, zoom, map])
    return null
}

function LocationMarker({ onLocationSelect, initialPos }: { onLocationSelect?: (lat: number, lng: number) => void, initialPos?: [number, number] }) {
    const [position, setPosition] = useState<[number, number] | null>(initialPos || null)

    // Update marker if initialPos changes externally
    useEffect(() => {
        if (initialPos) {
            setPosition(initialPos)
        }
    }, [initialPos])

    const map = useMapEvents({
        click(e) {
            if (onLocationSelect) {
                setPosition([e.latlng.lat, e.latlng.lng])
                onLocationSelect(e.latlng.lat, e.latlng.lng)
            }
        },
    })

    return position === null ? null : (
        <Marker position={position} />
    )
}


interface MapProps {
    properties?: any[]
    center: [number, number]
    zoom?: number
    onLocationSelect?: (lat: number, lng: number) => void
    staticMode?: boolean
    onSelectProperty?: (property: any) => void
}

// Custom Icons
const createIcon = (color: string) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const icons = {
    VENTA: createIcon('red'),
    ALQUILER: createIcon('blue'),
    ANTICRETICO: createIcon('violet'),
    default: createIcon('green')
}

const Map = ({ properties, center, zoom = 13, onLocationSelect, staticMode = false, onSelectProperty }: MapProps) => {
    return (
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%", zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController center={center} zoom={zoom} />

            {!staticMode && <LocationMarker onLocationSelect={onLocationSelect} initialPos={center} />}

            {properties && properties.map(prop => (
                <Marker
                    key={prop.id}
                    position={[prop.latitude, prop.longitude]}
                    icon={icons[prop.listingType as keyof typeof icons] || icons.default}
                >
                    <Popup>
                        <div className="text-sm">
                            <strong className="block text-base mb-1">{prop.title}</strong>
                            <div className="mb-2">
                                <span className="font-bold text-green-600">{prop.price} {prop.currency}</span>
                                <span className={`text-xs ml-2 px-2 py-0.5 rounded text-white ${prop.listingType === 'VENTA' ? 'bg-red-500' :
                                        prop.listingType === 'ALQUILER' ? 'bg-blue-500' : 'bg-purple-500'
                                    }`}>
                                    {prop.listingType}
                                </span>
                            </div>
                            {prop.images && prop.images.length > 0 && (
                                <img src={prop.images[0]} alt={prop.title} className="w-full h-24 object-cover rounded mb-2" />
                            )}

                            <div className="flex gap-2">
                                <a href={`https://wa.me/${prop.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 block text-center bg-green-500 text-white py-1 rounded hover:bg-green-600">
                                    WhatsApp
                                </a>
                                {onSelectProperty && (
                                    <button
                                        onClick={() => onSelectProperty(prop)}
                                        className="flex-1 block text-center bg-blue-500 text-white py-1 rounded hover:bg-blue-600 text-xs"
                                    >
                                        Ver Más
                                    </button>
                                )}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}

export default Map
