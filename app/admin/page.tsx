import AdminPanel from '@/components/AdminPanel'

export default function AdminPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>
                <AdminPanel />
            </div>
        </div>
    )
}
