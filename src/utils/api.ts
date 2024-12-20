import type { CreateList, CreateWish, Wishlist, WishlistGroup } from "./types"

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080"

const baseUrl = `${apiUrl}list`

export async function getList(id: string, username?: string): Promise<Wishlist | null> {
    const res = await fetch(`${baseUrl}/${id}`)
    if (!res.ok) {
        return null;
    }

    try {
        const list = await res.json() as Wishlist;
        if (username && list.user === username) {
            return {...list, wishes: list.wishes.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())}
        }
        return list
    } catch (err) {
        console.error('Error parsing JSON:', err);
        return null;
    }
}

export async function getGroup(id: string): Promise<WishlistGroup | null> {
    const res = await fetch(`${apiUrl}group/${id}`)
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

export async function createlist(data: CreateList, groupId?: string): Promise<Wishlist | null | undefined> {
    try {
        const res = await fetch(`${baseUrl}`, { body: JSON.stringify({ ...data, groupId }), method: "POST" })

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

export async function uploadPicture(picture: File): Promise<{ url: string | null } | null> {
    const formData = new FormData()
    formData.append("file", picture)

    const response = await fetch(`${baseUrl}/picture`, {
        method: "POST",
        body: formData,
    })

    if (!response.ok) {
        return null
    }

    return await response.json()
}

export async function deleteWish(listId: string, wishId: number) {
    const res = await fetch(`${baseUrl}/${listId}/wishes/${wishId}`, { method: "DELETE" })

    if (!res.ok) {
        return null
    }

    return true
}