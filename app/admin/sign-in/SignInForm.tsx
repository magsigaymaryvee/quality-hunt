"use client";

import { useActionState } from "react";
import { signInAction, type FormState } from "@/app/admin/actions";

const start: FormState = { message: "" };

export default function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, start);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-1">
        <label htmlFor="email" className="text-sm font-semibold">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required
          className="min-h-12 rounded-xl border-[1.5px] border-floor bg-white px-4" />
      </div>
      <div className="grid gap-1">
        <label htmlFor="password" className="text-sm font-semibold">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required
          className="min-h-12 rounded-xl border-[1.5px] border-floor bg-white px-4" />
      </div>
      {state.message && (
        <p role="alert" className="text-sm text-brick-text">{state.message}</p>
      )}
      <button type="submit" disabled={pending}
        className="min-h-11 rounded-full bg-eucalyptus px-5 font-semibold text-white hover:bg-ink disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}