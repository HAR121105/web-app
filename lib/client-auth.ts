export async function logoutClient() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("Logout error:", err);
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_session");
    window.location.replace("/login");
  }
}
