'use client'

import { useActionState } from 'react'
import { login } from '@/actions/auth'

export default function LoginPage() {
    const [state, action, isPending] = useActionState(login, undefined)

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
            <form action={action} className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md space-y-6 border border-gray-100">
                <h1 className="text-3xl font-bold text-center text-gray-800">Bienvenido de nuevo</h1>
                <p className="text-gray-500 text-center mb-4">Ingresa a tu cuenta para gestionar tus inmuebles</p>

                {state?.error && <p className="bg-red-50 text-red-600 p-3 rounded text-sm text-center border border-red-100">{state.error}</p>}

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900"
                        placeholder="ejemplo@correo.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                    <input
                        name="password"
                        type="password"
                        required
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900"
                        placeholder="••••••••"
                    />
                </div>
                <button disabled={isPending} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-300 font-semibold shadow-md active:scale-95 transform duration-150">
                    {isPending ? 'Validando...' : 'Ingresar'}
                </button>
            </form>
        </div>
    )
}
