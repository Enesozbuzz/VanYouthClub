"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }

      if (response.status === 422 && data.fields) {
        setFieldErrors(data.fields);
      }
      setError(data.error ?? "Giriş yapılamadı. Lütfen tekrar deneyin.");
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-flame/30 bg-flame/10 px-4 py-3 text-sm text-flame"
        >
          {error}
        </div>
      )}

      <Field label="E-posta" htmlFor="email" error={fieldErrors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="input"
          placeholder="admin@vanyouthclub.local"
        />
      </Field>

      <Field label="Şifre" htmlFor="password" error={fieldErrors.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          placeholder="••••••••"
        />
      </Field>

      <Button type="submit" loading={loading} className="w-full">
        Giriş Yap
      </Button>
    </form>
  );
}
