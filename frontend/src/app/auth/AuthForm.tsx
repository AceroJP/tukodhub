"use client";

import { FormEvent, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { authApi, type AuthenticatedAccount, type TenantMembershipSummary } from "@/lib/api";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const account = isRegister
        ? await authApi.register({
            businessName: String(formData.get("businessName") ?? "").trim(),
            ownerName: String(formData.get("ownerName") ?? "").trim(),
            phone: String(formData.get("phone") ?? "").trim() || undefined,
            email,
            password,
          })
        : await authApi.login({ email, password });

      const finalAccount = await ensureTenantSelection(account, email, password);
      const activeTenant = finalAccount.activeTenant;

      if (!activeTenant) {
        await Swal.fire({
          icon: "warning",
          title: "No active tenant selected",
          text: "Please try again and choose an available business.",
          confirmButtonColor: "#17624d",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: isRegister ? "Workspace created" : "Welcome back",
        text: `Signed in as ${finalAccount.user.displayName} (${activeTenant.tenantName}).`,
        confirmButtonColor: "#17624d",
      });

      navigateToTenantDashboard(activeTenant);
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

  async function ensureTenantSelection(
    account: AuthenticatedAccount,
    email: string,
    password: string,
  ): Promise<AuthenticatedAccount> {
    if (!account.requiresTenantSelection) {
      return account;
    }

    const selectedMembership = await promptTenantSelection(account.availableTenants);
    if (!selectedMembership) {
      throw new Error("Tenant selection was cancelled.");
    }

    const targetTenantHost = resolveTenantAppHost(selectedMembership.tenantSlug);
    return authApi.login({
      email,
      password,
      preferredTenantHost: targetTenantHost,
    });
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

  async function promptTenantSelection(
    memberships: TenantMembershipSummary[],
  ): Promise<TenantMembershipSummary | null> {
    if (memberships.length === 0) {
      return null;
    }

    if (memberships.length === 1) {
      return memberships[0];
    }

    const options = Object.fromEntries(
      memberships.map((membership) => [
        membership.membershipId,
        `${membership.tenantName} (${membership.roleName})`,
      ]),
    );

    const result = await Swal.fire<string>({
      title: "Select your business",
      input: "select",
      inputOptions: options,
      inputPlaceholder: "Select a business",
      confirmButtonText: "Continue",
      showCancelButton: true,
      confirmButtonColor: "#17624d",
      cancelButtonColor: "#9ca3af",
      inputValidator: (value) => (value ? undefined : "Please select a business."),
    });

    if (!result.isConfirmed || !result.value) {
      return null;
    }

    return memberships.find((membership) => membership.membershipId === result.value) ?? null;
  }

  function navigateToTenantDashboard(activeTenant: TenantMembershipSummary): void {
    const tenantHost = resolveTenantAppHost(activeTenant.tenantSlug);
    const tenantUrl = `${window.location.protocol}//${tenantHost}/dashboard`;

    if (tenantHost === window.location.host) {
      router.push("/dashboard");
      return;
    }

    window.open(tenantUrl, "_self");
  }
}

function resolveTenantAppHost(tenantSlug: string): string {
  const current = window.location;
  const portSegment = current.port ? `:${current.port}` : "";

  if (current.hostname === "localhost" || current.hostname.endsWith(".localhost")) {
    return `${tenantSlug}.localhost${portSegment}`;
  }

  const hostParts = current.hostname.split(".");
  const baseDomain = hostParts.length >= 3
    ? hostParts.slice(1).join(".")
    : current.hostname;

  return `${tenantSlug}.${baseDomain}${portSegment}`;
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


