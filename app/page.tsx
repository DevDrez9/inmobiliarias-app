'use client'

import { useUserLocation } from '@/hooks/useUserLocation'
import { getProperties, getCurrentUser, getPropertyById } from '@/actions/property'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { CITIES, CITY_COORDS } from '@/lib/constants'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center bg-gray-100">Cargando Mapa...</div>
})

import PropertyDetails from '@/components/PropertyDetails'

import { Suspense } from 'react'

function HomeContent() {
  const { city, coords, setCity, loading: locLoading } = useUserLocation()
  const [properties, setProperties] = useState<any[]>([])
  const [loadingProp, setLoadingProp] = useState(false)
  const [center, setCenter] = useState<[number, number] | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null)
  const [listingType, setListingType] = useState("TODOS")
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) setCurrentUserId(user.id)
    })
  }, [])

  /* 
     Deep Linking Logic 
     Check for 'id' in URL search params.
  */
  const searchParams = useSearchParams()
  const initialPropertyId = searchParams.get('id')

  useEffect(() => {
    if (initialPropertyId) {
      getPropertyById(initialPropertyId).then(prop => {
        if (prop) {
          setSelectedProperty(prop)
          // Also update city to match property so map centers correctly
          if (prop.city) setCity(prop.city)
        }
      })
    }
  }, [initialPropertyId])

  useEffect(() => {
    if (city) {
      setLoadingProp(true)
      getProperties(city, listingType).then(data => {
        setProperties(data)
        setLoadingProp(false)
      })
      // Update center based on selected city if valid
      if (CITY_COORDS[city]) {
        setCenter(CITY_COORDS[city])
      }
    }
  }, [city, listingType])

  // Initial load logic: prioritize GPS coords, then formatted city default, then hard La Paz
  const mapCenter: [number, number] = center || (coords ? [coords.lat, coords.lng] : [-16.500, -68.119])

  return (
    <div className="h-[calc(100vh-64px)] relative flex flex-col">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white p-3 rounded-lg shadow-xl flex items-center gap-3 border border-gray-100 flex-wrap justify-center min-w-[300px]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 hidden sm:inline">Ciudad:</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border-gray-200 border rounded-md p-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm min-w-[120px]"
          >
            {CITIES.map(c => <option key={c} value={c} className="text-gray-900">{c}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 hidden sm:inline">Tipo:</span>
          <select
            value={listingType}
            onChange={(e) => setListingType(e.target.value)}
            className="border-gray-200 border rounded-md p-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm min-w-[120px]"
          >
            <option value="TODOS">Todos</option>
            <option value="VENTA">Venta</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="ANTICRETICO">Anticretico</option>
          </select>
        </div>

        {locLoading && <span className="text-xs text-blue-600 animate-pulse font-medium">📍</span>}
        {loadingProp && <span className="text-xs text-gray-500 font-medium">↻</span>}
      </div>

      <div className="flex-1 w-full h-full relative z-0">
        <Map
          center={mapCenter}
          zoom={14}
          properties={properties}
          staticMode={true}
          onSelectProperty={setSelectedProperty}
        />
      </div>

      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Cargando...</div>}>
      <HomeContent />
    </Suspense>
  )
}
