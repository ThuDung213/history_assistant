export function isAdminLoggedIn() {
    return !!localStorage.getItem("admin_token");
}
