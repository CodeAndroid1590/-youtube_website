"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, passwordsMatch, COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const password = (formData.get("password") as string) || "";
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return {
      success: false,
      error:
        "ADMIN_PASSWORD is not configured on the server. Set it in your environment variables first.",
    };
  }

  if (!passwordsMatch(password, expected)) {
    return { success: false, error: "Incorrect password." };
  }

  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  redirect("/admin/login");
}
