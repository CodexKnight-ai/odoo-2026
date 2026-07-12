"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators/auth";

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

const ROLES = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

const ROLE_ACCESS = [
  { role: "Fleet Manager", access: "Fleet, Maintenance" },
  { role: "Dispatcher", access: "Dashboard, Trips" },
  { role: "Safety Officer", access: "Drivers, Compliance" },
  { role: "Financial Analyst", access: "Fuel & Expenses, Analytics" },
];

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState(null); // { message, locked }
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "Dispatcher",
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        setServerError({
          message: result.message || "Invalid credentials.",
          locked: result.locked || false,
        });
        return;
      }

      // Redirect based on role
      const roleRoutes = {
        "Fleet Manager": "/vehicles",
        Dispatcher: "/dashboard",
        "Safety Officer": "/drivers",
        "Financial Analyst": "/analytics",
      };
      router.push(roleRoutes[data.role] || "/dashboard");
    } catch (err) {
      setServerError({ message: "Something went wrong. Try again.", locked: false });
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
                <li key={role} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {role}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-slate-500">TransitOps © 2026 · RBAC Enabled</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold">Sign in to your account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your credentials to continue
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

            <div>
              <Label>Role (RBAC)</Label>
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
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

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
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 text-slate-900 hover:bg-amber-500"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <hr className="my-2 border-slate-200" />

            <div className="text-xs text-slate-500">
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
        <div className="fixed right-6 top-6 w-72 rounded-md border border-dashed border-red-400 bg-red-50 p-4">
          <p className="text-xs font-medium uppercase text-red-500">Error state</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            ✕ {serverError.message}
          </p>
          {serverError.locked && (
            <p className="mt-1 text-xs text-red-500">
              Account locked after 5 failed attempts.
            </p>
          )}
        </div>
      )}
    </div>
  );
}