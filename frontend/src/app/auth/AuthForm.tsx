"use client";

import { FormEvent, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

type AuthUser = {
  userId: string;
  email: string;
  displayName: string;
  tenantId: string;
  tenantName: string;
  role: string;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      ...(isRegister ? {
        businessName: String(formData.get("businessName") ?? ""),
        ownerName: String(formData.get("ownerName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
      } : {}),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const user = await apiRequest<AuthUser>(
        `/api/v1/auth/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      await Swal.fire({
        icon: "success",
        title: isRegister ? "Workspace created" : "Welcome back",
        text: `You are signed in as ${user.displayName}.`,
        confirmButtonColor: "#17624d",
      });
      router.push("/dashboard");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Unable to continue",
        text: error instanceof Error ? error.message : "Please check your details and try again.",
        confirmButtonColor: "#17624d",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      {isRegister && (
        <>
          <Field label="Business name" name="businessName" placeholder="e.g. Acero Aircon Services" required />
          <Field label="Your name" name="ownerName" placeholder="e.g. Joenil Acero" required />
          <Field label="Phone number" name="phone" placeholder="09xx xxx xxxx" type="tel" />
        </>
      )}
      <Field label="Email address" name="email" placeholder="you@business.com" type="email" required />
      <Field
        label="Password"
        name="password"
        placeholder={isRegister ? "At least 12 characters" : "Enter your password"}
        type="password"
        minLength={isRegister ? 12 : 1}
        required
      />
      <button
        className="flex w-full items-center justify-center rounded-xl bg-[#17624d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#17624d]/20 transition hover:bg-[#104c3c] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Please wait..." : isRegister ? "Create workspace" : "Sign in"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  ...props
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block text-sm font-semibold text-[#315147]">
      {label}
      <input
        className="mt-2 w-full rounded-xl border border-[#cbded4] bg-white px-4 py-3 font-normal text-[#17352d] outline-none transition placeholder:text-[#9aada5] focus:border-[#17624d] focus:ring-4 focus:ring-[#17624d]/10"
        name={name}
        placeholder={placeholder}
        type={type}
        {...props}
      />
    </label>
  );
}
