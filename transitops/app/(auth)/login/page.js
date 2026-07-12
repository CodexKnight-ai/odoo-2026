"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, ROLES } from "@/lib/validators/auth";
import { useAuthStore } from "@/store/authStore";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_ACCESS = [
  { role: "Fleet Manager", access: "Fleet, Maintenance" },
  { role: "Driver", access: "Dashboard, Trips" },
  { role: "Safety Officer", access: "Drivers, Compliance" },
  { role: "Financial Analyst", access: "Fuel & Expenses, Analytics" },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "register"

  const schema = mode === "login" ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      role: "DRIVER",
      rememberMe: true,
    },
  });

  const switchMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setServerError(null);
    reset();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);
    try {
      const payload = {
        email: data.email,
        password: data.password,
        action: mode,
      };
      if (mode === "register") {
        payload.role = data.role;
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        setServerError({
          message: result.error || "Invalid credentials.",
        });
        return;
      }

      // Store auth state
      login(result.token, result.user);

      // Redirect based on role
      const roleRoutes = {
        FLEET_MANAGER: "/dashboard",
        DRIVER: "/dashboard",
        SAFETY_OFFICER: "/dashboard",
        FINANCIAL_ANALYST: "/dashboard",
      };
      router.push(roleRoutes[result.user.role] || "/dashboard");
    } catch (err) {
      setServerError({ message: "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-[38%] flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
        <div>
          <div className="mb-6 h-14 w-14 rounded-md bg-amber-400" />
          <h1 className="text-2xl font-semibold">TransitOps</h1>
          <p className="mt-1 text-sm text-slate-400">
            Smart Transport Operations Platform
          </p>

          <div className="mt-12">
            <h2 className="mb-3 text-sm font-medium text-slate-300">
              One login, four roles:
            </h2>
            <ul className="space-y-2 text-sm text-slate-400">
              {ROLES.map((role) => (
                <li key={role.value} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {role.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-slate-500">TransitOps © 2026 · RBAC Enabled</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-foreground">
            {mode === "login" ? "Sign in to your account" : "Create an account"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Enter your credentials to continue"
              : "Register to get started with TransitOps"}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@transitops.in"
                className="mt-1.5"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="mt-1.5"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {mode === "register" && (
              <div>
                <Label>Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name="rememberMe"
                    render={({ field }) => (
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 text-slate-900 hover:bg-amber-500"
            >
              {loading
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            <hr className="my-2 border-border" />

            <div className="text-xs text-muted-foreground">
              <p className="mb-1.5">Access is scoped by role after login:</p>
              <ul className="space-y-1">
                {ROLE_ACCESS.map(({ role, access }) => (
                  <li key={role}>
                    • {role} → {access}
                  </li>
                ))}
              </ul>
            </div>
          </form>
        </div>
      </div>

      {/* Error state toast/box */}
      {serverError && (
        <div className="fixed right-6 top-6 w-72 rounded-md border border-dashed border-red-400 bg-red-50 dark:bg-red-950/50 p-4 z-50">
          <p className="text-xs font-medium uppercase text-red-500">Error</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
            ✕ {serverError.message}
          </p>
        </div>
      )}
    </div>
  );
}