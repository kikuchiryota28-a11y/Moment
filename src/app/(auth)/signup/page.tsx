import Link from "next/link";
import { signUp } from "@/actions/auth";
import { AuthShell } from "@/app/(auth)/login/page";

export default function SignupPage() {
  return <AuthShell title="Start your Journey." subtitle="Discover something. Try it. Make it a Moment."><form action={signUp} className="space-y-4"><input name="displayName" required placeholder="Display name" className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3"/><input name="username" required placeholder="Username (3–24 chars)" className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3"/><input name="email" type="email" required placeholder="Email" className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3"/><input name="password" type="password" minLength={8} required placeholder="Password (8+ characters)" className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3"/><button className="w-full rounded-2xl bg-[#171614] px-5 py-4 font-black text-white">Create account</button></form><p className="mt-6 text-center text-sm text-[#777269]">Already have an account? <Link href="/login" className="font-bold underline">Log in</Link></p></AuthShell>;
}
