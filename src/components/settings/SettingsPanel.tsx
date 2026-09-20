"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/actions/auth";
import { deleteAccount, updateEmail, updatePassword, updateSettings } from "@/actions/settings";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Surface";
import type { ThemePreference, Visibility } from "@/types/database";
import { isSuccess } from "@/lib/action-result";

interface SettingsState {
  theme: ThemePreference;
  notificationsEnabled: boolean;
  tryNotifications: boolean;
  reminderNotifications: boolean;
  activityVisibility: Visibility;
  experienceVisibility: Visibility;
}

export function SettingsPanel({ initial, email }: { initial: SettingsState; email: string }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  const [state, setState] = useState(initial);
  const [emailValue, setEmailValue] = useState(email);
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showDelete, setShowDelete] = useState(false);

  const emailDisplay = email ?? "";

  function save(next: SettingsState, rollback: SettingsState) {
    setState(next);
    startTransition(async () => {
      const result = await updateSettings(next);
      if (!result.success) {
        setState(rollback);
        if (next.theme !== rollback.theme) setTheme(rollback.theme);
        addToast({ message: result.error ?? "Failed to save settings", type: "error" });
        return;
      }
      addToast({ message: "Settings saved", type: "success" });
    });
  }

  function chooseTheme(next: ThemePreference) {
    const previous = state;
    setTheme(next);
    save({ ...state, theme: next }, previous);
  }

  function toggle(field: "notificationsEnabled" | "tryNotifications" | "reminderNotifications") {
    const previous = state;
    save({ ...state, [field]: !state[field] }, previous);
  }

  function setVisibility(field: "activityVisibility" | "experienceVisibility", value: Visibility) {
    const previous = state;
    save({ ...state, [field]: value }, previous);
  }

  function submitEmail() {
    startTransition(async () => {
      const result = await updateEmail(emailValue);
      if (!result.success) {
        addToast({ message: result.error ?? "Email update failed", type: "error" });
        return;
      }
      addToast({ message: "Check your email to confirm the address change.", type: "success" });
    });
  }

  function submitPassword() {
    startTransition(async () => {
      const result = await updatePassword(password);
      if (!result.success) {
        addToast({ message: result.error ?? "Password update failed", type: "error" });
        return;
      }
      setPassword("");
      addToast({ message: "Password updated.", type: "success" });
    });
  }

  function handleSignOut() {
    startTransition(async () => {
      const result = await signOut();
      if (!result.success) {
        addToast({ message: result.error ?? "Sign out failed", type: "error" });
        return;
      }
      router.replace("/login");
    });
  }

  function removeAccount() {
    startTransition(async () => {
      const result = await deleteAccount();
      if (!result.success) {
        addToast({ message: result.error ?? "Account deletion failed", type: "error" });
        return;
      }
      router.replace("/login");
    });
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <Badge variant="default" className="mb-2">Control</Badge>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Settings</h1>
        </div>
        <Link href="/profile/me">
          <Button variant="ghost" size="sm">Profile</Button>
        </Link>
      </div>

      <Section title="ACCOUNT">
        <Row label="Email" description={emailDisplay}>
          <div className="flex gap-2">
            <Input
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              type="email"
              autoComplete="email"
              className="flex-1"
            />
            <Button onClick={submitEmail} disabled={isPending} size="sm">
              Save
            </Button>
          </div>
        </Row>

        <Row label="Password" description="Update your MOMENT password">
          <div className="flex gap-2">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="8+ characters"
              className="flex-1"
            />
            <Button onClick={submitPassword} disabled={isPending} size="sm">
              Update
            </Button>
          </div>
        </Row>

        <Row label="Log out" description="End this session">
          <Button variant="secondary" onClick={handleSignOut} disabled={isPending} size="sm">
            Log out
          </Button>
        </Row>

        <Row label="Delete account" description="Permanently remove your MOMENT account">
          <Button variant="danger" onClick={() => setShowDelete(true)} disabled={isPending} size="sm">
            Delete
          </Button>
        </Row>
      </Section>

      <Section title="PREFERENCES">
        <Row label="Appearance" description="System, light, or dark">
          <div className="grid grid-cols-3 gap-2">
            {(["system", "light", "dark"] as const).map((value) => (
              <Button
                key={value}
                variant={theme === value ? "primary" : "secondary"}
                size="sm"
                onClick={() => chooseTheme(value)}
                disabled={isPending}
                aria-pressed={theme === value}
                className="capitalize"
              >
                {value}
              </Button>
            ))}
          </div>
        </Row>

        <ToggleRow label="Notifications" checked={state.notificationsEnabled} disabled={isPending} onChange={() => toggle("notificationsEnabled")} />
        <ToggleRow label="TRY activity" checked={state.tryNotifications} disabled={isPending || !state.notificationsEnabled} onChange={() => toggle("tryNotifications")} />
        <ToggleRow label="Reminders" checked={state.reminderNotifications} disabled={isPending || !state.notificationsEnabled} onChange={() => toggle("reminderNotifications")} />
      </Section>

      <Section title="PRIVACY & DATA">
        <VisibilityRow
          label="Activity visibility"
          value={state.activityVisibility}
          disabled={isPending}
          onChange={(value) => setVisibility("activityVisibility", value)}
          description="Controls whether your published Moments appear publicly."
        />
        <VisibilityRow
          label="Experience visibility"
          value={state.experienceVisibility}
          disabled={isPending}
          onChange={(value) => setVisibility("experienceVisibility", value)}
          description="Controls whether completed Journey activity is publicly readable."
        />
      </Section>

      <Section title="ABOUT">
        <Row label="About MOMENT" description="Discover something worth doing." />
        <Row label="Terms" description="Legal information" />
        <Row label="Privacy" description="Privacy information" />
        <Row label="Contact" description="Get in touch" />
      </Section>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-[20px] bg-[var(--color-overlay)] p-6 shadow-[var(--shadow-overlay)]">
            <h2 id="delete-title" className="text-xl font-semibold text-[var(--color-ink)]">
              Delete your account?
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted-ink)]">
              This permanently removes your profile, Moments, Journeys, likes, comments, and follows. This cannot be undone.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setShowDelete(false)} disabled={isPending} fullWidth>
                Cancel
              </Button>
              <Button variant="danger" onClick={removeAccount} disabled={isPending} fullWidth>
                {isPending ? "Deleting…" : "Delete account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <Badge variant="default" className="mb-3">{title}</Badge>
      <Card variant="outlined" className="divide-y divide-[var(--color-line)] overflow-hidden">
        {children}
      </Card>
    </section>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--color-ink)]">{label}</p>
        {description && <p className="mt-1 text-xs leading-5 text-[var(--color-muted-ink)]">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <Row label={label}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onChange}
        className={`
          relative h-7 w-12 rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          disabled:opacity-40 disabled:cursor-not-allowed
          ${checked ? "bg-[var(--color-ink)]" : "bg-[var(--color-line)]"}
        `}
      >
        <span
          className={`
            absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200
            ${checked ? "left-6" : "left-1"}
          `}
          aria-hidden="true"
        />
      </button>
    </Row>
  );
}

function VisibilityRow({
  label,
  description,
  value,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  value: Visibility;
  disabled?: boolean;
  onChange: (value: Visibility) => void;
}) {
  return (
    <Row label={label} description={description}>
      <div className="grid grid-cols-2 gap-2">
        {(["public", "private"] as const).map((item) => (
          <Button
            key={item}
            variant={value === item ? "primary" : "secondary"}
            size="sm"
            onClick={() => onChange(item)}
            disabled={disabled}
            aria-pressed={value === item}
            className="capitalize"
          >
            {item}
          </Button>
        ))}
      </div>
    </Row>
  );
}