import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";
import { HeaderNav } from "@/app/(app)/HeaderNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  async function logout() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    redirect("/login");
  }

  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="top-nav__brand">
          <span className="top-nav__brand-title">RupeeValcore</span>
          <span className="top-nav__brand-subtitle">CRM</span>
        </div>

        <HeaderNav />

        <div className="top-nav__actions">
          <form action={logout}>
            <button type="submit" className="btn btn-secondary">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
