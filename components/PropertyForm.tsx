'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createProperty, updateProperty } from '@/actions/property'
import { CITIES, CITY_COORDS } from '@/lib/constants'

// Load Map dynamically to prevent SSR issues
const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded flex items-center justify-center">Cargando Mapa...</div>
})

interface PropertyFormProps {
    initialData?: any
    propertyId?: string
}

export default function PropertyForm({ initialData, propertyId }: PropertyFormProps) {
    // Default to La Paz center or initialData location
    const [position, setPosition] = useState<{ lat: number, lng: number }>(
        initialData
            ? { lat: initialData.latitude, lng: initialData.longitude }
            : { lat: -16.500, lng: -68.119 }
    )
    const [userCity, setUserCity] = useState(initialData ? initialData.city : "La Paz")

    // IMAGE MANAGEMENT STATE
    // keptImages: URLs of images already on server (for Edit mode)
    const [keptImages, setKeptImages] = useState<string[]>(initialData?.images || [])

    // selectedFiles: New files user wants to upload
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    // previews: Object URLs for the new files
    const [previews, setPreviews] = useState<string[]>([])

    const [error, setError] = useState<string | null>(null)

    const handleLocationSelect = (lat: number, lng: number) => {
        setPosition({ lat, lng })
    }

    // Sync map center when city changes
    useEffect(() => {
        if (CITY_COORDS[userCity]) {
            // Optional: Logic to prevent jump on initial edit load could go here
        }
    }, [userCity])

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCity = e.target.value
        setUserCity(newCity)
        if (CITY_COORDS[newCity]) {
            const [lat, lng] = CITY_COORDS[newCity]
            setPosition({ lat, lng })
        }
    }

    // ADD Images (Append)
    const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        setError(null)

        // Calculate current total
        const currentTotal = keptImages.length + selectedFiles.length + files.length

        // 1. Validate Max 5 Files Total
        if (currentTotal > 5) {
            setError(`Error: El límite es de 5 imágenes. Tienes ${keptImages.length + selectedFiles.length} y quieres agregar ${files.length}.`)
            e.target.value = ""
            return
        }

        // 2. Validate Max Size (5MB)
        const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024)
        if (invalidFiles.length > 0) {
            setError(`Error: ${invalidFiles.length} imagen(es) exceden el límite de 5MB.`)
            e.target.value = ""
            return
        }

        // Append valid files
        const newFilesList = [...selectedFiles, ...files]
        setSelectedFiles(newFilesList)

        // Generate Previews for NEW files
        const newPreviews = files.map(file => URL.createObjectURL(file))
        setPreviews([...previews, ...newPreviews])

        // Reset input to allow adding same file again if needed (though browser handles this)
        e.target.value = ""
    }

    // REMOVE Kept Image
    const removeKeptImage = (index: number) => {
        setKeptImages(prev => prev.filter((_, i) => i !== index))
    }

    // REMOVE New File
    const removeNewFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (formData: FormData) => {
        const totalImages = keptImages.length + selectedFiles.length

        if (totalImages === 0) {
            setError("Debes tener al menos una imagen (existente o nueva).")
            return
        }

        if (totalImages > 5) {
            setError("Máximo 5 imágenes permitidas.")
            return
        }

        try {
            // Append kept images to formData so Server Action knows what to keep
            // Note: formData.getAll('keptImages') on server
            keptImages.forEach(url => {
                formData.append('keptImages', url)
            })

            // 'images' (new files) are already in formData because input name="images"
            // BUT input name="images" might be empty if we used a custom handler and reset it?
            // Actually, the input type="file" only contains the LAST selection if we don't manage it carefully.
            // We are using a controlled "Add" flow. The file input usually clears or holds one batch.
            // WE MUST manually append the 'selectedFiles' to formData because the standard HTML submission
            // only sends what's currently in the <input>.

            // Clear any default 'images' from the empty/reset input
            formData.delete('images')

            // Append our state-managed files
            selectedFiles.forEach(file => {
                formData.append('images', file)
            })

            if (propertyId) {
                await updateProperty(propertyId, formData)
            } else {
                await createProperty(formData)
            }
        } catch (e: any) {
            console.error(e)
            setError(e.message || "Error al guardar la propiedad")
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl border border-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
                {propertyId ? 'Editar Inmueble' : 'Publicar Inmueble'}
            </h2>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-700 font-bold">Atención</p>
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
                    <input name="title" defaultValue={initialData?.title} required className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="Ej: Casa en Sopocachi" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Precio</label>
                    <div className="flex">
                        <input name="price" defaultValue={initialData?.price} type="number" step="0.01" required className="block w-full border border-gray-300 rounded-l-lg shadow-sm p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="0.00" />
                        <select name="currency" defaultValue={initialData?.currency || "BOB"} className="border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 p-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="BOB">BOB</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea name="description" defaultValue={initialData?.description} rows={3} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="Detalles del inmueble..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Inmueble</label>
                    <select name="listingType" defaultValue={initialData?.listingType || "VENTA"} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                        <option value="VENTA">Venta</option>
                        <option value="ALQUILER">Alquiler</option>
                        <option value="ANTICRETICO">Anticrético</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad</label>
                    <select
                        name="city"
                        value={userCity}
                        onChange={handleCityChange}
                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación Exacta (Pin en el Mapa)</label>
                <p className="text-xs text-blue-600 mb-2 font-medium">Haz clic en el mapa para ajustar la ubicación.</p>
                <div className="h-72 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Map
                        center={[position.lat, position.lng]}
                        zoom={13}
                        onLocationSelect={handleLocationSelect}
                    />
                </div>
                {/* Hidden inputs to send coords to the Server Action */}
                <input type="hidden" name="latitude" value={position.lat} />
                <input type="hidden" name="longitude" value={position.lng} />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp de Contacto</label>
                <input name="whatsapp" defaultValue={initialData?.whatsapp} placeholder="59170000000" required className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            </div>

            {/* ENHANCED IMAGE MANAGEMENT */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fotos - <span className="text-gray-500 font-normal">Máx 5 imágenes (Solo faltan {5 - (keptImages.length + selectedFiles.length)})</span>
                </label>

                <div className="flex flex-wrap gap-4 mb-4">
                    {/* Kept Images (Existing) */}
                    {keptImages.map((src, index) => (
                        <div key={`kept-${index}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                            <img src={src} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                            <button
                                type="button"
                                onClick={() => removeKeptImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition"
                            >
                                &times;
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded">Guardada</span>
                        </div>
                    ))}

                    {/* New Selected Images */}
                    {previews.map((src, index) => (
                        <div key={`new-${index}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-blue-200 shadow-sm group ring-2 ring-blue-100">
                            <img src={src} alt={`New ${index}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeNewFile(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition"
                            >
                                &times;
                            </button>
                            <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1 rounded">Nueva</span>
                        </div>
                    ))}

                    {/* Add Button */}
                    {(keptImages.length + selectedFiles.length) < 5 && (
                        <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition text-gray-400 hover:text-indigo-600">
                            <span className="text-2xl font-bold">+</span>
                            <span className="text-xs font-semibold">Agregar</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleImageAdd}
                            />
                        </label>
                    )}
                </div>
            </div>

            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {propertyId ? 'Guardar Cambios' : 'Publicar Propiedad'}
            </button>
        </form>
    )
}
