"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
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
  const [registerStep, setRegisterStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const slugPreview = useMemo(() => toTenantSlug(businessName), [businessName]);
  const workspacePreviewHost = useMemo(
    () => (slugPreview ? resolveTenantAppHost(slugPreview) : null),
    [slugPreview],
  );

  const canAdvanceFromBusinessStep = businessName.trim().length >= 3;
  const canAdvanceFromSecurityStep =
    ownerName.trim().length >= 2 && email.trim().length > 0 && password.length >= 12;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const normalizedEmail = email.trim();

    try {
      const account = isRegister
        ? await authApi.register({
            businessName: businessName.trim(),
            ownerName: ownerName.trim(),
            phone: phone.trim() || undefined,
            email: normalizedEmail,
            password,
          })
        : await authApi.login({ email: normalizedEmail, password });

      const finalAccount = await ensureTenantSelection(account, normalizedEmail, password);
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
        text: isRegister
          ? `Redirecting you to ${activeTenant.tenantName}...`
          : `Signed in as ${finalAccount.user.displayName} (${activeTenant.tenantName}).`,
        timer: isRegister ? 2200 : undefined,
        timerProgressBar: isRegister,
        showConfirmButton: !isRegister,
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

  function nextRegisterStep() {
    setRegisterStep((current) => Math.min(current + 1, 3));
  }

  function previousRegisterStep() {
    setRegisterStep((current) => Math.max(current - 1, 1));
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      {isRegister ? (
        <>
          <StepPills activeStep={registerStep} />
          {registerStep === 1 && (
            <>
              <Field
                label="Business name"
                name="businessName"
                placeholder="e.g. Acero Aircon Services"
                required
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                helperText="This is what your team and customers will see."
              />
              <WorkspacePreview host={workspacePreviewHost} slug={slugPreview} />
              <button
                className="flex w-full items-center justify-center rounded-xl bg-[#17624d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#17624d]/20 transition hover:bg-[#104c3c] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canAdvanceFromBusinessStep}
                onClick={nextRegisterStep}
                type="button"
              >
                Continue to account setup
              </button>
            </>
          )}
          {registerStep === 2 && (
            <>
              <Field
                label="Your name"
                name="ownerName"
                placeholder="e.g. Joenil Acero"
                required
                value={ownerName}
                onChange={(event) => setOwnerName(event.target.value)}
              />
              <Field
                label="Phone number"
                name="phone"
                placeholder="09xx xxx xxxx"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              <Field
                label="Email address"
                name="email"
                placeholder="you@business.com"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                helperText="We use this for sign-in and important security alerts."
              />
              <Field
                label="Password"
                name="password"
                placeholder="At least 12 characters"
                type="password"
                minLength={12}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                helperText="Use uppercase, lowercase, and numbers."
              />
              <div className="flex items-center gap-3">
                <button
                  className="flex-1 rounded-xl border border-[#cbded4] px-5 py-3.5 text-sm font-bold text-[#315147] transition hover:bg-[#f4f8f6]"
                  onClick={previousRegisterStep}
                  type="button"
                >
                  Back
                </button>
                <button
                  className="flex-1 rounded-xl bg-[#17624d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#17624d]/20 transition hover:bg-[#104c3c] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canAdvanceFromSecurityStep}
                  onClick={nextRegisterStep}
                  type="button"
                >
                  Review details
                </button>
              </div>
            </>
          )}
          {registerStep === 3 && (
            <>
              <ReviewSummary
                businessName={businessName}
                email={email}
                ownerName={ownerName}
                phone={phone}
                workspaceHost={workspacePreviewHost}
              />
              <div className="rounded-2xl border border-[#dce9df] bg-[#f7fbf9] px-4 py-3 text-sm text-[#315147]">
                <p className="font-semibold">What happens next</p>
                <p className="mt-1">We create your workspace, sign you in as the first owner, then redirect you to the tenant dashboard.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex-1 rounded-xl border border-[#cbded4] px-5 py-3.5 text-sm font-bold text-[#315147] transition hover:bg-[#f4f8f6]"
                  onClick={previousRegisterStep}
                  type="button"
                >
                  Back
                </button>
                <button
                  className="flex flex-1 items-center justify-center rounded-xl bg-[#17624d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#17624d]/20 transition hover:bg-[#104c3c] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Creating workspace..." : "Create workspace & owner account"}
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <Field
            label="Email address"
            name="email"
            placeholder="you@business.com"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Field
            label="Password"
            name="password"
            placeholder="Enter your password"
            type="password"
            minLength={1}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            className="flex w-full items-center justify-center rounded-xl bg-[#17624d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#17624d]/20 transition hover:bg-[#104c3c] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Please wait..." : "Sign in"}
          </button>
        </>
      )}
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

function StepPills({ activeStep }: { activeStep: number }) {
  const steps = ["Business", "Account", "Review"];

  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#dce9df] bg-[#f7fbf9] p-2 text-xs font-semibold text-[#5f7a70]">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === activeStep;

        return (
          <div
            className={`rounded-xl px-3 py-2 text-center transition ${isActive ? "bg-[#17624d] text-white" : "bg-white"}`}
            key={step}
          >
            {stepNumber}. {step}
          </div>
        );
      })}
    </div>
  );
}

function WorkspacePreview({ host, slug }: { host: string | null; slug: string }) {
  return (
    <div className="rounded-2xl border border-[#dce9df] bg-[#f7fbf9] px-4 py-3 text-sm text-[#315147]">
      <p className="font-semibold">Workspace preview</p>
      <p className="mt-1">
        {host
          ? `Your default tenant URL will be: ${host}`
          : "Enter a business name to preview your tenant URL."}
      </p>
      {slug ? <p className="mt-1 text-xs text-[#657970]">Slug: {slug}</p> : null}
    </div>
  );
}

function ReviewSummary({
  businessName,
  ownerName,
  phone,
  email,
  workspaceHost,
}: {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  workspaceHost: string | null;
}) {
  return (
    <div className="rounded-2xl border border-[#dce9df] bg-white p-4 text-sm text-[#315147]">
      <p className="font-semibold text-[#17352d]">Review your details</p>
      <dl className="mt-3 space-y-2">
        <div className="flex justify-between gap-3">
          <dt className="text-[#657970]">Business</dt>
          <dd className="text-right font-medium">{businessName || "-"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#657970]">Owner</dt>
          <dd className="text-right font-medium">{ownerName || "-"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#657970]">Phone</dt>
          <dd className="text-right font-medium">{phone || "Optional"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#657970]">Email</dt>
          <dd className="text-right font-medium">{email || "-"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#657970]">Workspace</dt>
          <dd className="text-right font-medium">{workspaceHost || "Will be assigned"}</dd>
        </div>
      </dl>
    </div>
  );
}

function toTenantSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
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
  helperText,
  ...props
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
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
      {helperText ? <span className="mt-1 block text-xs font-normal text-[#657970]">{helperText}</span> : null}
    </label>
  );
}


