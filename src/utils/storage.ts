export function setUser(username: string) {
    localStorage.setItem("username", username);
}

export function getUser() {
    return localStorage.getItem("username");
}