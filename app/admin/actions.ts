"use server"; // these functions run only on the server, never in the browser

import { redirect } from "next/navigation";
import { requireAdmin, signIn, signOut, signOutEverywhere } from "@/lib/auth";

export type FormState = { message: string };

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { message: "Enter your email and password." };

  const result = await signIn(email, password);
  if (!result.ok) return { message: result.message };
  redirect("/admin");
}

export async function signOutAction() {
  await signOut();
  redirect("/admin/sign-in");
}

export async function signOutEverywhereAction() {
  const admin = await requireAdmin();
  await signOutEverywhere(admin.id);
  redirect("/admin/sign-in");
}