import { z } from "zod";

export const ROLES = [
  { value: "FLEET_MANAGER", label: "Fleet Manager" },
  { value: "DRIVER", label: "Driver" },
  { value: "SAFETY_OFFICER", label: "Safety Officer" },
  { value: "FINANCIAL_ANALYST", label: "Financial Analyst" },
];

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"]),
});