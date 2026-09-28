import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Yönetici Girişi",
  robots: { index: false, follow: false },
};

/**
 * Login lives outside the guarded admin layout (route group) so that the
 * server-side guard in src/app/admin/layout.tsx does not create a redirect
 * loop for unauthenticated visitors.
 */
export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="section flex min-h-[70vh] items-center">
      <div className="container-page max-w-md">
        <div className="card p-7">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-acid text-sm font-black text-ink-950"
            >
              VY
            </span>
            <span className="text-sm font-extrabold tracking-wide text-white">
              VAN YOUTH CLUB
            </span>
          </div>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-white">
            Yönetici Girişi
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Yönetim paneline erişmek için yönetici hesabınla giriş yap.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
