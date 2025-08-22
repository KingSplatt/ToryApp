import zod from 'zod';

export const LoginSchema = zod.object({
  email: zod
    .string({ message: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email format").regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
  password: zod
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must be less than 100 characters"),
});
