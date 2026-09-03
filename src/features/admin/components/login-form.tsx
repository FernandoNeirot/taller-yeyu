"use client";

import { useActionState } from "react";
import { loginAction } from "../actions/login-action";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} style={{ width: "100%" }} className="flex flex-col gap-md">
      {state?.error && (
        <div className="bg-error-container/20 border border-error/40 text-error px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <label className="flex flex-col gap-xs">
        <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase">
          Usuario
        </span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:border-primary transition-colors"
          placeholder="elizabeth o fernando"
        />
      </label>

      <label className="flex flex-col gap-xs">
        <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase">
          Contraseña
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:border-primary transition-colors"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full mt-sm px-6 py-3 bg-primary-container text-white font-label-caps text-label-caps tracking-widest uppercase rounded-lg hover:bg-secondary-container transition-colors disabled:opacity-50"
      >
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
