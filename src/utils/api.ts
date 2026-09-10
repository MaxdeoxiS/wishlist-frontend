import type { CreateList, CreateWish, Wishlist, WishlistGroup } from "./types"

const rawUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080"
const apiUrl = rawUrl.endsWith("/") ? rawUrl : `${rawUrl}/`

const baseUrl = `${apiUrl}list`

export async function getList(id: string, username?: string): Promise<Wishlist | null> {
    const res = await fetch(`${baseUrl}/${id}`)
    if (!res.ok) {
        return null;
    }

    try {
        const list = await res.json() as Wishlist;
        if (username && list.user === username) {
            return {
                ...list,
                wishes: list.wishes
                    .map(w => ({ ...w, bought_by: undefined }))
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            }
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

export async function uploadPicture(picture: File): Promise<{ url: string | null; error?: string }> {
    // 1. Try presigned S3 URL first (direct S3 upload, bypassing serverless limits)
    try {
        const presignedRes = await fetch(`${baseUrl}/picture/upload-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                filename: picture.name,
                contentType: picture.type || "image/jpeg",
            }),
        });

        if (presignedRes.ok) {
            const { uploadUrl, publicUrl } = await presignedRes.json();
            if (uploadUrl && publicUrl) {
                const s3Upload = await fetch(uploadUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": picture.type || "image/jpeg",
                    },
                    body: picture,
                });

                if (s3Upload.ok) {
                    return { url: publicUrl };
                } else {
                    console.error("S3 direct upload failed:", s3Upload.status);
                    return { url: null, error: `Erreur d'envoi vers le stockage (${s3Upload.status})` };
                }
            }
        }
    } catch (e) {
        console.warn("Presigned upload unavailable or failed, falling back to direct backend:", e);
    }

    // 2. Fallback to direct backend upload via /list/picture
    try {
        const formData = new FormData();
        formData.append("file", picture);

        const response = await fetch(`${baseUrl}/picture`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            let errorDetail = "";
            try {
                const errJson = await response.json();
                errorDetail = errJson.error || errJson.message || "";
            } catch {
                errorDetail = await response.text().catch(() => "");
            }
            return {
                url: null,
                error: errorDetail || `Erreur serveur (${response.status})`,
            };
        }

        const data = await response.json();
        return { url: data?.url ?? null };
    } catch (err: any) {
        console.error("Error uploading picture:", err);
        return {
            url: null,
            error: err?.message || "Erreur de connexion au serveur",
        };
    }
}

export async function deleteWish(listId: string, wishId: number) {
    const res = await fetch(`${baseUrl}/${listId}/wishes/${wishId}`, { method: "DELETE" })

    if (!res.ok) {
        return null
    }

    return true
}