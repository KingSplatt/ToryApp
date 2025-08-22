import zod from 'zod';

export const RegisterSchema = zod.object({
  email: zod
    .string({ message: "Email is required" })
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: zod
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must be less than 100 characters"),
  fullName: zod
    .string({ message: "Full name is required" })
    .min(2, "Full name must be at least 2 characters long")
    .max(100, "Full name must be less than 100 characters"),
});
