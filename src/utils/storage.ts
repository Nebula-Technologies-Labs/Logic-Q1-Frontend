export const storage = {
    setToken(token: string) {
        localStorage.setItem("Token", token);
    },

    clear() {
        localStorage.clear();
    },
};