'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID
const FB_APP_SECRET = process.env.FB_APP_SECRET

export async function saveFacebookConnection(shortLivedToken: string, userId: string) {
    if (!userId) return { error: "User ID required" }

    try {
        // 1. Exchange Short-Lived User Token for Long-Lived User Token
        const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${shortLivedToken}`
        const longLivedRes = await fetch(longLivedUrl)
        const longLivedData = await longLivedRes.json()

        if (longLivedData.error) {
            console.error("Error getting long-lived token:", longLivedData.error)
            return { error: "Failed to get long-lived token" }
        }

        const longLivedUserToken = longLivedData.access_token

        // 2. Get Accounts (Pages) to find the Page Access Token
        const accountsUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedUserToken}`
        const accountsRes = await fetch(accountsUrl)
        const accountsData = await accountsRes.json()

        if (accountsData.error || !accountsData.data || accountsData.data.length === 0) {
            console.error("Error getting accounts:", accountsData.error)
            return { error: "No Pages found for this user" }
        }

        // 3. Select the first page (or you could logic to select a specific one)
        // For MVP, we take the first one.
        const page = accountsData.data[0]
        const pageAccessToken = page.access_token
        const pageId = page.id
        const pageName = page.name

        // 4. Save to Database
        await prisma.user.update({
            where: { id: userId },
            data: {
                facebookAccessToken: pageAccessToken,
                facebookPageId: pageId,
                facebookPageName: pageName
            } as any // Temporary cast to bypass stale client types if necessary
        })

        return { success: true, pageName }

    } catch (error) {
        console.error("Facebook Connection Error:", error)
        return { error: "Internal Server Error during Facebook connection" }
    }
}

export async function disconnectFacebook(userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            facebookAccessToken: null,
            facebookPageId: null,
            facebookPageName: null
        }
    })
    return { success: true }
}

export async function postToFacebookPage(userId: string, message: string, imageUrl: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { facebookAccessToken: true, facebookPageId: true }
        })

        if (!user || !user.facebookAccessToken || !user.facebookPageId) {
            return { error: "User is not connected to a Facebook Page" }
        }

        const pageId = user.facebookPageId
        const token = user.facebookAccessToken

        // Post Photo
        const url = `https://graph.facebook.com/v19.0/${pageId}/photos`

        // FormData not typically used for JSON API, use URL params or JSON body depending on endpoint
        // For photos with 'url' param:
        const params = new URLSearchParams()
        params.append('url', imageUrl)
        params.append('caption', message) // or 'message' field
        params.append('access_token', token)
        // params.append('published', 'true')

        const res = await fetch(url, {
            method: 'POST',
            body: params
        })

        const data = await res.json()

        if (data.error) {
            console.error("FB Post Error:", data.error)
            return { error: data.error.message }
        }

        return { success: true, postId: data.id }

    } catch (error) {
        console.error("FB Post Exception:", error)
        return { error: "Exception posting to Facebook" }
    }
}
