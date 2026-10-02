export type AuthUser = {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
};

/**
 * Check if the user is currently logged in with a valid session
 */
export function getActiveUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      if (u && (u.id || u.email) && u.email && u.email !== "pelanggan@hostingwebid.com") {
        return {
          id: u.id || 0,
          name: u.name || u.username || u.email.split("@")[0],
          email: u.email,
          role: u.role || "user",
          phone: u.phone || u.whatsapp || "",
        };
      }
    }

    const authRaw = localStorage.getItem("hostingweb_auth");
    if (authRaw) {
      const a = JSON.parse(authRaw);
      if (a && a.loggedIn && a.email && a.email !== "pelanggan@hostingwebid.com") {
        const u = {
          id: a.id || 0,
          name: a.name || a.username || a.email.split("@")[0],
          email: a.email,
          role: a.role || "user",
          phone: a.phone || a.whatsapp || "",
        };
        localStorage.setItem("hostingwebid_user", JSON.stringify(u));
        return u;
      }
    }
  } catch (err) {
    console.warn("Error reading user auth state:", err);
  }

  return null;
}

/**
 * Returns true if a valid user is logged in
 */
export function isUserLoggedIn(): boolean {
  return getActiveUser() !== null;
}

/**
 * Directs user to login if not authenticated, otherwise proceeds to target URL
 */
export function navigateWithAuthCheck(routerPush: (url: string) => void, targetUrl: string): void {
  if (isUserLoggedIn()) {
    routerPush(targetUrl);
  } else {
    routerPush(`/login?redirect=${encodeURIComponent(targetUrl)}`);
  }
}
