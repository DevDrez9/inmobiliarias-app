import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PropertyForm from '@/components/PropertyForm'
import Navbar from '@/components/Navbar'

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session) redirect('/login')

    const { id } = await params

    const property = await prisma.property.findUnique({
        where: { id }
    })

    if (!property) return <div className="p-8 text-center">Propiedad no encontrada</div>

    if (property.userId !== session.user.id) {
        return <div className="p-8 text-center text-red-600">No tienes permiso para editar esta propiedad.</div>
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-12">
            <Navbar />
            <div className="pt-8">
                <PropertyForm initialData={property} propertyId={property.id} />
            </div>
        </main>
    )
}
