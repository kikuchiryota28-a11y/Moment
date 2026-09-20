"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    display_name: "",
    username: "",
  });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.set(k, v));
    const result = await signUp(fd);
    setBusy(false);
    if (result.success) {
      router.push("/");
    } else {
      addToast({ message: result.error ?? "Signup failed", type: "error" });
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6 bg-[var(--color-canvas)]">
      <Card variant="default" className="w-full max-w-md p-8">
        <header className="text-center mb-8">
          <Badge variant="accent" className="mb-3">MOMENT</Badge>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Create your account</h1>
          <p className="mt-2 text-sm text-[var(--color-muted-ink)]">Start discovering something worth doing</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            autoComplete="email"
            required
            disabled={busy}
          />
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            autoComplete="username"
            placeholder="unique username"
            required
            disabled={busy}
          />
          <Input
            label="Display name"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            autoComplete="name"
            placeholder="How you want to appear"
            required
            disabled={busy}
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            autoComplete="new-password"
            placeholder="8+ characters"
            required
            disabled={busy}
          />

          <Button type="submit" loading={busy} fullWidth size="lg" className="mt-2">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-muted-ink)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}