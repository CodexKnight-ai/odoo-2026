import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"]),
  rememberMe: z.boolean().optional(),
});