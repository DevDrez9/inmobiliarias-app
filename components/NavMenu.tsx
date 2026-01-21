'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logout } from '@/actions/auth'

interface NavMenuProps {
    user?: {
        name: string | null
        role: string
    }
}

export default function NavMenu({ user }: NavMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-gray-700 font-medium">Hola, {user.name}</span>
                        {user.role === 'ADMIN' && (
                            <Link href="/admin" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium">
                                Panel Admin
                            </Link>
                        )}
                        <Link href="/publicar" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium">
                            Publicar
                        </Link>
                        <button onClick={() => logout()} className="text-red-500 hover:text-red-700 font-medium px-2">
                            Salir
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="text-gray-700 hover:text-indigo-600 font-medium">
                            Ingresar
                        </Link>
                        <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-md">
                            Registrarse
                        </Link>
                    </>
                )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-700 hover:text-indigo-600 focus:outline-none"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-4 flex flex-col gap-4 md:hidden z-20">
                    {user ? (
                        <>
                            <span className="text-gray-700 font-medium border-b pb-2">Hola, {user.name}</span>
                            {user.role === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium text-center"
                                >
                                    Panel Admin
                                </Link>
                            )}
                            <Link
                                href="/publicar"
                                onClick={() => setIsOpen(false)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-center"
                            >
                                Publicar
                            </Link>
                            <button
                                onClick={() => logout()}
                                className="text-red-500 hover:text-red-700 font-medium px-2 py-2 text-center border-t pt-2"
                            >
                                Salir
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="text-gray-700 hover:text-indigo-600 font-medium text-center py-2"
                            >
                                Ingresar
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setIsOpen(false)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-md text-center"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            )}
        </>
    )
}
