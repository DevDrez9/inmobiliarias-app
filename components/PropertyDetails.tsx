'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { deleteProperty } from '@/actions/property'
import { useRouter } from 'next/navigation'

interface Property {
    id: string
    title: string
    description: string
    price: number
    currency: string
    listingType: string
    images: string[]
    whatsapp: string
    city: string
    userId: string
}

interface PropertyDetailsProps {
    property: Property
    onClose: () => void
    currentUserId?: string
}

export default function PropertyDetails({ property, onClose, currentUserId }: PropertyDetailsProps) {
    const router = useRouter()
    const [currentImage, setCurrentImage] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de eliminar esta propiedad?")) return
        setIsDeleting(true)
        try {
            await deleteProperty(property.id)
            onClose()
            window.location.reload()
        } catch (error) {
            alert("Error al eliminar")
            setIsDeleting(false)
        }
    }

    const handleEdit = () => {
        router.push(`/editar/${property.id}`)
    }

    // Ensure we render on client side (for portal) - typically invoked from client component anyway
    if (typeof document === 'undefined') return null

    const handleNext = () => {
        setCurrentImage((prev) => (prev + 1) % property.images.length)
    }

    const handlePrev = () => {
        setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length)
    }

    const modalContent = (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>

                {/* Images Section */}
                <div className="md:w-1/2 bg-gray-100 relative h-72 md:h-auto min-h-[300px] flex-shrink-0">
                    {property.images.length > 0 ? (
                        <>
                            <img
                                src={property.images[currentImage]}
                                alt={property.title}
                                className="w-full h-full object-cover cursor-zoom-in"
                                onClick={() => setIsLightboxOpen(true)}
                            />

                            {property.images.length > 1 && (
                                <>
                                    <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition">
                                        ←
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition">
                                        →
                                    </button>
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-xs text-white px-2 py-1 rounded-full">
                                        {currentImage + 1} / {property.images.length}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">Sin imágenes</div>
                    )}
                </div>

                {/* Details Section */}
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mr-2">
                            {property.listingType}
                        </span>
                        <span className="text-xl font-bold text-green-600">
                            {property.price} {property.currency}
                        </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed overflow-y-auto flex-1 mb-6 max-h-60 text-sm md:text-base">
                        {property.description}
                    </p>

                    <div className="mt-auto space-y-3">
                        <p className="text-sm text-gray-500 mb-4">Ubicación: <span className="font-medium text-gray-900">{property.city}</span></p>

                        <a
                            href={`https://wa.me/${property.whatsapp}?text=Hola, me interesa la propiedad: ${property.title}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-green-500 hover:bg-green-600 text-white text-center font-bold py-3 rounded-xl transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Contactar por WhatsApp
                        </a>

                        {/* Owner Actions */}
                        {currentUserId === property.userId && (
                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleEdit}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded font-medium transition"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded font-medium transition disabled:opacity-50"
                                >
                                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    const lightboxContent = isLightboxOpen ? (
        <div className="fixed inset-0 z-[3000] bg-black flex items-center justify-center p-4" onClick={() => setIsLightboxOpen(false)}>
            <button className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10" onClick={() => setIsLightboxOpen(false)}>✕</button>
            <img
                src={property.images[currentImage]}
                alt={property.title}
                className="max-w-full max-h-full object-contain"
                onClick={e => e.stopPropagation()}
            />
            {property.images.length > 1 && (
                <>
                    <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full text-2xl theme-transition">
                        ❮
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full text-2xl theme-transition">
                        ❯
                    </button>
                </>
            )}
        </div>
    ) : null;

    return createPortal(
        <>
            {modalContent}
            {lightboxContent}
        </>,
        document.body
    )
}
