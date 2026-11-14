const USERNAME_KEY = "wish.list_username";
const LIST_KEY = "wish.list_listId";
const GROUP_KEY = "wish.list_groupId";
const RECENT_GROUPS_KEY = "wish.list_recentGroups";
const PERSONAL_CHECKLIST_PREFIX = "wish.list_personalChecklist_";
const PERSONAL_CHECKLIST_REMOVED_PREFIX = "wish.list_personalChecklistRemoved_";

export type StoredGroup = { id: string; title: string };

export type PersonalChecklistItem = {
    id: string;
    name: string;
    checked: boolean;
};

export function getPersonalChecklist(groupId: string): PersonalChecklistItem[] | null {
    try {
        const raw = localStorage.getItem(`${PERSONAL_CHECKLIST_PREFIX}${groupId}`);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function savePersonalChecklist(groupId: string, items: PersonalChecklistItem[]) {
    try {
        localStorage.setItem(`${PERSONAL_CHECKLIST_PREFIX}${groupId}`, JSON.stringify(items));
    } catch (e) {
        console.error("Failed to save personal checklist to localStorage", e);
    }
}

export function getRemovedChecklistNames(groupId: string): string[] {
    try {
        const raw = localStorage.getItem(`${PERSONAL_CHECKLIST_REMOVED_PREFIX}${groupId}`);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function addRemovedChecklistName(groupId: string, name: string) {
    try {
        const current = getRemovedChecklistNames(groupId);
        const normalized = name.trim().toLowerCase();
        if (!current.includes(normalized)) {
            current.push(normalized);
            localStorage.setItem(`${PERSONAL_CHECKLIST_REMOVED_PREFIX}${groupId}`, JSON.stringify(current));
        }
    } catch (e) {
        console.error("Failed to save removed checklist name to localStorage", e);
    }
}

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
