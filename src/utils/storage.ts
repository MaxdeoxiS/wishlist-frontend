const USERNAME_KEY = "wish.list_username";
const LIST_KEY = "wish.list_listId";
const GROUP_KEY = "wish.list_groupId";
const RECENT_GROUPS_KEY = "wish.list_recentGroups";

export type StoredGroup = { id: string; title: string };

export function setUser(username: string) {
    localStorage.setItem(USERNAME_KEY, username);
}

export function getUser() {
    return localStorage.getItem(USERNAME_KEY);
}

export function deleteUser() {
    return localStorage.removeItem(USERNAME_KEY);
}

export function setList(id: string) {
    localStorage.setItem(LIST_KEY, `${id}`);
}

export async function clearLists() {
    localStorage.removeItem(LIST_KEY);
}

export function getLists() {
    const lists = localStorage.getItem(LIST_KEY);
    return lists?.split(",") ?? [];
}

export function setGroup(id: string) {
    localStorage.setItem(GROUP_KEY, id);
}

export function getStoredGroupId(): string | null {
    return localStorage.getItem(GROUP_KEY);
}

export function clearGroups() {
    localStorage.removeItem(GROUP_KEY);
    localStorage.removeItem(RECENT_GROUPS_KEY);
}

export function saveRecentGroup(group: StoredGroup) {
    try {
        const existing = getRecentGroups().filter(g => g.id !== group.id);
        const updated = [group, ...existing].slice(0, 5);
        localStorage.setItem(RECENT_GROUPS_KEY, JSON.stringify(updated));
        setGroup(group.id);
    } catch (e) {
        console.error("Failed to save recent group to localStorage", e);
    }
}

export function getRecentGroups(): StoredGroup[] {
    try {
        const raw = localStorage.getItem(RECENT_GROUPS_KEY);
        if (!raw) {
            const single = getStoredGroupId();
            return single ? [{ id: single, title: "Mon groupe" }] : [];
        }
        return JSON.parse(raw);
    } catch {
        return [];
    }
}
