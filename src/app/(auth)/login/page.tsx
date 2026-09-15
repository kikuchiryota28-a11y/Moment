import Link from "next/link";
import { signIn } from "@/actions/auth";

export default function LoginPage() {
  return <AuthShell title="Welcome back." subtitle="Your next experience is waiting."><form action={signIn} className="space-y-4"><input name="email" type="email" required placeholder="Email" className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3"/><input name="password" type="password" required placeholder="Password" className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3"/><button className="w-full rounded-2xl bg-[#171614] px-5 py-4 font-black text-white">Log in</button></form><p className="mt-6 text-center text-sm text-[#777269]">New here? <Link href="/signup" className="font-bold text-[#171614] underline">Create an account</Link></p></AuthShell>;
}
export function AuthShell({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}) { return <main className="flex min-h-screen items-center justify-center px-4 py-10"><div className="w-full max-w-md"><Link href="/" className="text-xl font-black tracking-[-0.04em]">MOMENT<span className="text-[#ef6b35]">.</span></Link><div className="mt-12"><h1 className="text-4xl font-black tracking-[-0.05em]">{title}</h1><p className="mt-3 text-[#777269]">{subtitle}</p></div><div className="mt-8">{children}</div></div></main>; }
