'use client'

import { useState, useEffect } from 'react'
import { getAllUsers, updateUserRole, updateUserLimit } from '@/actions/admin'

type User = {
    id: string
    email: string
    name: string | null
    role: 'ADMIN' | 'INMOBILIARIA' | 'GRATIS'
    maxProperties: number
    createdAt: Date
    _count: { properties: number }
}

export default function AdminPanel() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const data = await getAllUsers()
            setUsers(data as any)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateUserRole(userId, newRole as any)
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
        } catch (e) {
            alert("Error al actualizar rol")
        }
    }

    const handleLimitChange = async (userId: string, newLimit: string) => {
        const limit = parseInt(newLimit)
        if (isNaN(limit)) return
        try {
            await updateUserLimit(userId, limit)
            setUsers(users.map(u => u.id === userId ? { ...u, maxProperties: limit } : u))
        } catch (e) {
            alert("Error al actualizar límite")
        }
    }

    if (loading) return <div className="p-10 text-center">Cargando panel...</div>
    if (error) return <div className="p-10 text-center text-red-600">Error: {error}</div>

    return (
        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Límite</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publicados</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name || 'Sin nombre'}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className={`text-sm rounded-full px-3 py-1 font-semibold border-0 cursor-pointer ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'INMOBILIARIA' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}
                                    >
                                        <option value="GRATIS">GRATIS</option>
                                        <option value="INMOBILIARIA">INMOBILIARIA</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="number"
                                        value={user.maxProperties}
                                        onChange={(e) => handleLimitChange(user.id, e.target.value)}
                                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user._count.properties}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
