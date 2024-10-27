import type { CreateList, CreateWish, Wishlist } from "./types"

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080"

const baseUrl = `${apiUrl}list`

export async function getLists() {
    const res = await fetch(baseUrl)
    return await res.json()
}

export async function getList(id: string): Promise<Wishlist | null> {
    const res = await fetch(`${baseUrl}/${id}`)
    if (!res.ok) {
        return null;
    }

    try {
        return await res.json();
    } catch (err) {
        console.error('Error parsing JSON:', err);
        return null;
    }
}

export async function setBought(id: string, wishId: number, value: string | null) {
    try {
        const res = await fetch(`${baseUrl}/${id}/wishes/${wishId}/toggle`, { body: JSON.stringify({ bought_by: value }), method: "PUT" })
        if (!res.ok) {
            return null;
        }

        try {
            return await res.json();
        } catch (err) {
            console.error('Error parsing JSON:', err);
            return null;
        }
    }
    catch (e) {
        console.error(e)
    }
}

export async function addWish(id: string, data: CreateWish) {
    try {
        const res = await fetch(`${baseUrl}/${id}/wishes`, { body: JSON.stringify(data), method: "POST" })

        if (!res.ok) {
            return null
        }
        try {
            return await res.json();
        } catch (err) {
            console.error('Error parsing JSON:', err);
            return null;
        }
    } catch (e) {
        console.error(e)
    }
}

export async function createlist(data: CreateList): Promise<Wishlist | null | undefined> {
    try {
        const res = await fetch(`${baseUrl}`, { body: JSON.stringify(data), method: "POST" })

        if (!res.ok) {
            return null
        }
        try {
            return await res.json();
        } catch (err) {
            console.error('Error parsing JSON:', err);
            return null;
        }
    } catch (e) {
        console.error(e)
    }
}