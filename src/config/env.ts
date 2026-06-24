export const env = {
    apiUrl:
        import.meta.env.VITE_API_URL ??
        import.meta.env.VITE_API_BASE_URL ??
        "",

    googleLoginUrl:
        import.meta.env.VITE_GOOGLE_LOGIN_URL ??
        "",
};