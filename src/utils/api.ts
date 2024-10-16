export async function getLists() {
    const res = await fetch("http://localhost:8080/list")
    return await res.json()
}