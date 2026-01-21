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

                        <div className="flex gap-2">
                            <a
                                href={`https://wa.me/${property.whatsapp}?text=Hola, me interesa la propiedad: ${property.title}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center font-bold py-3 rounded-xl transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                                WhatsApp
                            </a>

                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/?id=${property.id}`
                                    navigator.clipboard.writeText(url)
                                    alert('¡Enlace copiado al portapapeles!')
                                }}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 rounded-xl font-medium transition flex items-center justify-center"
                                title="Copiar Enlace"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            </button>
                        </div>

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
