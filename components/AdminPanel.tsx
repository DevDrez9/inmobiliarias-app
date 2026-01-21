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

declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

import { saveFacebookConnection, disconnectFacebook } from '@/actions/facebook'
import Script from 'next/script'

interface AdminPanelProps {
    currentUser?: {
        id: string
        name?: string | null
        role?: string
    }
}

export default function AdminPanel({ currentUser }: AdminPanelProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [fbConnected, setFbConnected] = useState(false)
    const [fbPageName, setFbPageName] = useState<string | null>(null)

    useEffect(() => {
        loadUsers()
    }, [])

    const handleFacebookLogin = () => {
        if (!window.FB) return;
        window.FB.login((response: any) => {
            if (response.authResponse) {
                if (!currentUser?.id) {
                    alert("Error: No se pudo identificar al usuario actual.")
                    return
                }

                // Exchange token
                saveFacebookConnection(response.authResponse.accessToken, currentUser.id)
                    .then((res) => {
                        if (res.success) {
                            alert(`Conectado a la página: ${res.pageName}`)
                            setFbConnected(true)
                            setFbPageName(res.pageName || 'Página Conectada')
                        } else {
                            alert(`Error: ${res.error}`)
                        }
                    })
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, { scope: 'pages_show_list,pages_read_engagement,pages_manage_posts' });
    }

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
            <Script
                src="https://connect.facebook.net/en_US/sdk.js"
                onLoad={() => {
                    window.fbAsyncInit = function () {
                        window.FB.init({
                            appId: process.env.NEXT_PUBLIC_FB_APP_ID,
                            cookie: true,
                            xfbml: true,
                            version: 'v19.0'
                        });
                    };
                }}
            />

            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-700">Usuarios del Sistema</h2>

                {currentUser?.role === 'ADMIN' && (
                    <div className="flex items-center gap-4">
                        {fbConnected ? (
                            <span className="text-green-600 font-medium flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Conectado: {fbPageName}
                            </span>
                        ) : (
                            <button
                                onClick={handleFacebookLogin}
                                className="bg-[#1877F2] hover:bg-[#166fe5] text-white px-4 py-2 rounded font-bold flex items-center gap-2 transition shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                Conectar Página
                            </button>
                        )}
                    </div>
                )}
            </div>

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
