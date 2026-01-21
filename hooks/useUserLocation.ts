import { useState, useEffect } from 'react'

export function useUserLocation() {
    const [city, setCity] = useState<string>("La Paz") // Default fallback
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            setCoords({ lat: latitude, lng: longitude })

            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                const data = await res.json()
                if (data && data.address) {
                    // Heuristic for city name
                    const userCity = data.address.city || data.address.town || data.address.village || data.address.county || "La Paz"
                    setCity(userCity)
                }
            } catch (error) {
                console.error("Reverse geocoding failed", error)
            } finally {
                setLoading(false)
            }
        }, (error) => {
            console.error("Geolocation blocked or failed", error)
            setLoading(false)
        })
    }, [])

    return { city, coords, setCity, loading }
}
