import type { Wishlist } from "./types"

export async function getLists() {
    const res = await fetch("http://localhost:8080/list")
    return await res.json()
}

export async function getList(hash: string): Promise<Wishlist | null> {
    const res = await fetch(`http://localhost:8080/list/${hash}`)
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

export async function setBought(hash: string, wishId: number, value: string) {
    try {
        const res = await fetch(`http://localhost:8080/list/${hash}/wishes/${wishId}/toggle`, { body: JSON.stringify({ bought_by: value }), method: "PUT" })
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