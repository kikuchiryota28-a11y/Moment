import Link from "next/link";
import { signUp } from "@/actions/auth";
import { AuthShell } from "@/app/(auth)/login/page";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return <AuthShell title="Start your Journey." subtitle="Discover something. Try it. Make it a Moment."><AuthForm action={signUp} mode="signup"/><p className="mt-6 text-center text-sm text-[#777269]">Already have an account? <Link href="/login" className="font-bold underline">Log in</Link></p></AuthShell>;
}
