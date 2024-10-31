const USERNAME_KEY = "wish.list_username";
const LIST_KEY = "wish.list_listId";

export function setUser(username: string) {
    localStorage.setItem(USERNAME_KEY, username);
}

export function getUser() {
    return localStorage.getItem(USERNAME_KEY);
}

export function deleteUser() {
    return localStorage.removeItem(USERNAME_KEY)
}

export function setList(id: string) {
    const lists =  localStorage.getItem(LIST_KEY)
    localStorage.setItem(LIST_KEY, `${lists},${id}`);
}

export async function clearLists() {
    localStorage.removeItem(LIST_KEY);
}

export function getLists() {
    const lists =  localStorage.getItem(LIST_KEY)
    return lists?.split(",") ?? [];
}