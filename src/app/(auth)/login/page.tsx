"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);
    const result = await signIn(fd);
    setBusy(false);
    if (result.success) {
      router.push("/");
    } else {
      addToast({ message: result.error ?? "Login failed", type: "error" });
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6 bg-[var(--color-canvas)]">
      <Card variant="default" className="w-full max-w-md p-8">
        <header className="text-center mb-8">
          <Badge variant="accent" className="mb-3">MOMENT</Badge>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Welcome back</h1>
          <p className="mt-2 text-sm text-[var(--color-muted-ink)]">Enter your credentials to continue</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={busy}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={busy}
          />

          <Button type="submit" loading={busy} fullWidth size="lg" className="mt-2">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-muted-ink)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[var(--color-accent)] hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </main>
  );
}