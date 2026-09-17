"use server";

import { redirect } from "next/navigation";
import { login } from "../services/auth";

export async function loginAction(_prev: unknown, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Completá usuario y contraseña" };
  }

  try {
    const result = await login(username, password);

    if (!result.ok) {
      return { error: result.error };
    }
  } catch (error) {
    console.error("Admin login action failed:", error);
    return { error: "No se pudo iniciar sesión. Probá de nuevo en un momento." };
  }

  redirect("/admin");
}
