'use server'

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

async function verifyAdmin() {
    const session = await getSession()
    if (!session) return false
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    return user?.role === 'ADMIN'
}

export async function getAllUsers() {
    if (!await verifyAdmin()) throw new Error("Acceso denegado")

    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { properties: true }
            }
        }
    })
}

export async function updateUserRole(userId: string, role: 'ADMIN' | 'INMOBILIARIA' | 'GRATIS') {
    if (!await verifyAdmin()) throw new Error("Acceso denegado")

    await prisma.user.update({
        where: { id: userId },
        data: { role }
    })
}

export async function updateUserLimit(userId: string, maxProperties: number) {
    if (!await verifyAdmin()) throw new Error("Acceso denegado")

    await prisma.user.update({
        where: { id: userId },
        data: { maxProperties }
    })
}
