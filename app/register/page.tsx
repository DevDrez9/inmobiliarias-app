'use client'

import { useActionState } from 'react'
import { register } from '@/actions/auth'

export default function RegisterPage() {
    const [state, action, isPending] = useActionState(register, undefined)

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
            <form action={action} className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md space-y-6 border border-gray-100">
                <h1 className="text-3xl font-bold text-center text-gray-800">Crear Cuenta</h1>
                <p className="text-gray-500 text-center mb-4">Únete a GeoInmuebles para publicar tus propiedades</p>

                {state?.error && <p className="bg-red-50 text-red-600 p-3 rounded text-sm text-center border border-red-100">{state.error}</p>}

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                    <input
                        name="name"
                        type="text"
                        required
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                        placeholder="Juan Pérez"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                        placeholder="ejemplo@correo.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                    <input
                        name="password"
                        type="password"
                        required
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                        placeholder="••••••••"
                    />
                </div>
                <button disabled={isPending} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 font-semibold shadow-md active:scale-95 transform duration-150">
                    {isPending ? 'Registrando...' : 'Crear Cuenta'}
                </button>
            </form>
        </div>
    )
}
