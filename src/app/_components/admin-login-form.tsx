"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { SymbolName } from "@/app/_components/material-symbol";
import { MaterialSymbol } from "@/app/_components/material-symbol";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type TextInputProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password";
  icon: Extract<SymbolName, "person" | "lock">;
  trailingAction?: React.ReactNode;
  actionSlotPadding?: string;
  labelAction?: React.ReactNode;
};

function TextInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
  trailingAction,
  actionSlotPadding = "pr-4",
  labelAction,
}: TextInputProps) {
  return (
    <div className="space-y-2">
      {labelAction ? (
        <div className="ml-1 flex items-center justify-between">
          <label
            htmlFor={id}
            className="font-label text-sm font-semibold tracking-wide text-on-surface-variant"
          >
            {label}
          </label>
          {labelAction}
        </div>
      ) : (
        <label
          htmlFor={id}
          className="ml-1 block font-label text-sm font-semibold tracking-wide text-on-surface-variant"
        >
          {label}
        </label>
      )}

      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <MaterialSymbol
            name={icon}
            className="size-5 text-outline transition-colors group-focus-within:text-primary"
          />
        </div>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-DEFAULT border-0 bg-surface-container-low py-4 pl-11 ${actionSlotPadding} text-base font-medium text-on-surface placeholder:text-base placeholder:text-outline/60 transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-fixed-dim focus:outline-none`}
        />
        {trailingAction}
      </div>
    </div>
  );
}

export function AdminLoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage ? (
        <div className="flex items-center gap-3 rounded-DEFAULT border border-error-container/20 bg-error-container/10 p-4">
          <MaterialSymbol name="error" className="size-5 text-error" />
          <p className="text-sm font-medium text-on-error-container">{errorMessage}</p>
        </div>
      ) : null}

      <TextInput
        id="identifier"
        label="Email"
        placeholder="Email"
        value={identifier}
        onChange={setIdentifier}
        icon="person"
      />

      <TextInput
        id="password"
        label="Password"
        placeholder="Password"
        value={password}
        onChange={setPassword}
        type={showPassword ? "text" : "password"}
        icon="lock"
        actionSlotPadding="pr-12"
        labelAction={
          <a
            href="#"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-dim"
          >
            Forgot Password?
          </a>
        }
        trailingAction={
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-outline transition-colors hover:text-on-surface-variant"
          >
            <MaterialSymbol
              name={showPassword ? "visibility_off" : "visibility"}
              className="size-6"
            />
          </button>
        }
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-DEFAULT bg-primary px-6 py-4 text-base font-headline font-bold text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01] hover:bg-primary-dim hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        <span>{isSubmitting ? "Logging in..." : "Login"}</span>
        <MaterialSymbol name="arrow_forward" className="size-[18px]" />
      </button>
    </form>
  );
}
