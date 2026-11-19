// app/admin/sign-in/page.tsx  →  yoursite/admin/sign-in
import type { Metadata } from "next";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false }, // keep search engines away
};

export default function SignInPage() {
  return (
    <div className="mx-auto grid max-w-sm gap-6 px-4 py-16">
      <h1 className="text-[32px] font-extrabold">Admin sign in</h1>
      <SignInForm />
    </div>
  );
}