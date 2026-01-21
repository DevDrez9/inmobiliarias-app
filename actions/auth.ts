'use server'

import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/auth"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function register(prevState: any, formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    if (!email || !password) return { error: "Missing fields" }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        })

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const session = await encrypt({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, expires })

            ; (await cookies()).set("session", session, { expires, httpOnly: true })
    } catch (e) {
        console.error(e)
        return { error: "User already exists or failed to create" }
    }

    redirect("/")
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return { error: "Invalid credentials" }
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, expires })

        ; (await cookies()).set("session", session, { expires, httpOnly: true })

    redirect("/")
}

export async function logout() {
    ; (await cookies()).set("session", "", { expires: new Date(0) })
    redirect("/login")
}
