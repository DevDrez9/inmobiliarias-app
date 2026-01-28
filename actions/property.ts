'use server'

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
    const session = await getSession()
    return session ? session.user : null
}

export async function createProperty(formData: FormData) {
    const session = await getSession()
    if (!session) redirect("/login")

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string)
    const currency = formData.get("currency") as "BOB" | "USD"
    const listingType = formData.get("listingType") as "VENTA" | "ALQUILER" | "ANTICRETICO"
    const city = formData.get("city") as string
    const latitude = parseFloat(formData.get("latitude") as string)
    const longitude = parseFloat(formData.get("longitude") as string)
    const whatsapp = formData.get("whatsapp") as string

    // Verify Role Limits
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { _count: { select: { properties: true } } }
    })

    if (!user) {
        throw new Error("Usuario no encontrado.")
    }

    if (user.role !== 'ADMIN') {
        const currentCount = user._count.properties
        if (currentCount >= user.maxProperties) {
            throw new Error(`Has alcanzado el límite de publicaciones (${user.maxProperties}) para tu plan ${user.role}.`)
        }
    }

    // NOTE: In create mode, we only expect 'images' (new files).
    const files = formData.getAll("images") as File[]
    const validFiles = files.filter(f => f.size > 0)
    const imageUrls: string[] = []

    // Upload logic adhering strictly to Microservice Contract
    if (validFiles.length === 0) {
        throw new Error("Es obligatorio subir al menos una imagen.")
    }

    if (files.length > 5) {
        throw new Error("Máximo 5 imágenes permitidas por propiedad.")
    }

    // Validate File Size (5MB limit) before processing
    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
            throw new Error(`La imagen ${file.name} excede el tamaño máximo permitido de 5MB.`)
        }
    }

    if (files.length > 0) {

        // 1. Verify Environment
        // 1. Verify Environment
        const encodedKey = process.env.IMAGE_SERVICE_API_KEY || '';
        const apiKey = Buffer.from(encodedKey, 'base64').toString('utf-8');
        console.log("Clave recuperada:", apiKey);
        if (!apiKey) {
            console.error("CRITICAL: IMAGE_SERVICE_API_KEY is missing in .env")
            throw new Error("Configuración del servidor incompleta (API Key missing).")
        }

        const uploadPromises = files.map(async (file, index) => {
            const uploadFormData = new FormData()

            // 2. FormData Order: 'folder' MUST be first
            uploadFormData.append("folder", "inmobiliaria")
            // 3. Then 'file'
            uploadFormData.append("file", file)

            try {
                const uploadUrl = `${process.env.IMAGE_SERVICE_URL}/upload`
                console.log(`[Upload #${index}] Starting upload to: ${uploadUrl}`)

                const response = await fetch(uploadUrl, {
                    method: "POST",
                    body: uploadFormData,
                    headers: {
                        // 4. Header: x-api-key (lowercase)
                        "x-api-key": apiKey
                    }
                })

                console.log(`[Upload #${index}] Response Status: ${response.status} ${response.statusText}`)

                if (!response.ok) {
                    // 5. Error Handling: Log text response
                    const errorText = await response.text()
                    console.error(`[Upload #${index}] Failed. Server response: ${errorText}`)
                    throw new Error(`Microservicio rechazó la imagen: ${response.status} - ${errorText}`)
                }

                const data = await response.json()
                console.log(`[Upload #${index}] Success. URL:`, data.url)
                return data.url

            } catch (error: any) {
                console.error(`[Upload #${index}] Exception:`, error.message)
                throw error
            }
        })

        try {
            // Wait for all uploads. If ANY fail, Promise.all throws.
            const results = await Promise.all(uploadPromises)
            results.forEach(url => {
                if (url) imageUrls.push(url)
            })
        } catch (error: any) {
            console.error("Aborting Property Creation due to upload failure:", error.message)
            // Strict abort: Do not create property in DB
            throw new Error("Error al publicar: No se pudieron subir las fotos. " + error.message)
        }
    }

    const property = await prisma.property.create({
        data: {
            title,
            description,
            price, // Already parsed
            currency: currency as any,
            listingType: listingType as any,
            city,
            latitude, // Already parsed
            longitude, // Already parsed
            whatsapp,
            images: imageUrls,
            userId: session.user.id
        }
    })

    // FACEBOOK INTEGRATION
    const postToFacebook = formData.get("postToFacebook") === "true"
    if (postToFacebook) {
        console.log("Attempting to post to Facebook...")
        // Import dynamically or ensure it's imported at top
        const { postToFacebookPage } = await import('./facebook')

        // Message: Title + City + Price + Link (optional)
        const message = `${title} en ${city}\n\n${description.substring(0, 150)}...\n\nPrecio: ${price} ${currency}\nContactar: https://wa.me/${whatsapp}`

        // Post first image
        if (imageUrls.length > 0) {
            const fbRes = await postToFacebookPage(session.user.id, message, imageUrls[0])
            if (fbRes.success) {
                console.log("Posted to Facebook successfully:", fbRes.postId)
            } else {
                console.error("Failed to post to Facebook:", fbRes.error)
                // Optional: Throw warning? For now just log so we don't block the UI redirect.
            }
        }
    }

    redirect("/")
}

export async function updateProperty(id: string, formData: FormData) {
    const session = await getSession()
    if (!session) redirect("/login")

    const existingProperty = await prisma.property.findUnique({ where: { id } })
    if (!existingProperty || existingProperty.userId !== session.user.id) {
        throw new Error("No tienes permiso para editar esta propiedad.")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string)
    const currency = formData.get("currency") as "BOB" | "USD"
    const listingType = formData.get("listingType") as "VENTA" | "ALQUILER" | "ANTICRETICO"
    const city = formData.get("city") as string
    const latitude = parseFloat(formData.get("latitude") as string)
    const longitude = parseFloat(formData.get("longitude") as string)
    const whatsapp = formData.get("whatsapp") as string

    // Handle new images if any
    const files = formData.getAll("images") as File[]
    const keptImages = formData.getAll("keptImages") as string[]

    // NOTE: keptImages comes from the client helper hidden inputs or state logic
    // We expect the form to send us everything we need to persist.

    // Filter out empty files (input type=file sometimes sends empty entry)
    const validFiles = files.filter(f => f.size > 0)

    const totalCount = keptImages.length + validFiles.length

    if (totalCount === 0) {
        throw new Error("La propiedad debe tener al menos una imagen.")
    }

    if (totalCount > 5) {
        throw new Error("Máximo 5 imágenes permitidas por propiedad.")
    }

    let imageUrls: string[] = [...keptImages]

    if (validFiles.length > 0) {
        // ... (reuse upload logic or create helper, for now implementing inline for speed)
        // Check size
        for (const file of validFiles) {
            if (file.size > 5 * 1024 * 1024) throw new Error(`La imagen ${file.name} excede el límite de 5MB.`)
        }

        // Reuse upload code block... (omitted for brevity in prompt, but necessary in real code)
        // For this context, I'll copy the upload logic part.
        const encodedKey = process.env.IMAGE_SERVICE_API_KEY || '';
        const apiKey = Buffer.from(encodedKey, 'base64').toString('utf-8');
        if (!apiKey) throw new Error("API Key missing")

        const uploadPromises = validFiles.map(async (file) => {
            const uploadFormData = new FormData()
            uploadFormData.append("folder", "inmobiliaria")
            uploadFormData.append("file", file)
            const res = await fetch(`${process.env.IMAGE_SERVICE_URL}/upload`, {
                method: "POST", headers: { "x-api-key": apiKey }, body: uploadFormData
            })
            if (!res.ok) throw new Error(await res.text())
            return (await res.json()).url
        })

        const newUrls = await Promise.all(uploadPromises)
        imageUrls = [...imageUrls, ...newUrls]
    }

    await prisma.property.update({
        where: { id },
        data: {
            title, description, price, currency, listingType, city, latitude, longitude, whatsapp, images: imageUrls
        }
    })

    redirect("/")
}

export async function deleteProperty(id: string) {
    const session = await getSession()
    if (!session) throw new Error("No autenticado")

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    const property = await prisma.property.findUnique({ where: { id } })

    if (!property || !user) throw new Error("Recurso no encontrado")

    const isAdmin = user.role === 'ADMIN'
    const isOwner = property.userId === session.user.id

    if (!isOwner && !isAdmin) {
        throw new Error("No tener permisos suficientes para eliminar esta propiedad.")
    }

    await prisma.property.delete({ where: { id } })
    return { success: true }
}

export async function getProperties(city: string, listingType?: string) {
    try {
        const whereClause: any = { city }
        if (listingType && listingType !== "TODOS") {
            whereClause.listingType = listingType
        }

        const properties = await prisma.property.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        })
        return properties
    } catch (error) {
        console.error("Failed to fetch properties", error)
        return []
    }
}

export async function getPropertyById(id: string) {
    try {
        const property = await prisma.property.findUnique({
            where: { id }
        })
        return property
    } catch (error) {
        console.error(`Failed to fetch property ${id}`, error)
        return null
    }
}
