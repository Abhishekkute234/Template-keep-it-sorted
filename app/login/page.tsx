import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginFlow } from "@/components/auth/LoginFlow";
import { Logo } from "@/components/ui/Logo";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Sign in — Keep It Sorted" };

/** Only allow same-site relative redirects. */
function safeNext(raw: string | string[] | undefined) {
  const next = typeof raw === "string" ? raw : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/account";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);

  return (
    <main className="auth">
      <section className="auth__brand" aria-hidden>
        <Logo size={88} />
        <p className="auth__quote">
          “Keep it sorted.”
          <span>— every designer, at 2:47 AM</span>
        </p>
      </section>
      <section className="auth__form">
        <LoginFlow next={next} />
      </section>
    </main>
  );
}
