import { z } from "zod";

const createUserValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        error: "Name is required",
      })
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must not exceed 100 characters"),

    email: z.string().email("Invalid email format"),

    phone: z
      .string()
      .regex(/^[0-9+\-\s]{7,15}$/, "Invalid phone number")
      .optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
        "Password must contain uppercase, lowercase, number, and special character",
      )
      .optional(),

    role: z.enum(["ADMIN", "PATIENT", "DONOR"], {
      error: "Role must be ADMIN, PATIENT, or DONOR",
    }),
  }),
});

const createDonorProfileValidationSchema = z.object({
  body: z.object({
    bloodGroup: z.enum([
      "A_POS",
      "A_NEG",
      "B_POS",
      "B_NEG",
      "AB_POS",
      "AB_NEG",
      "O_POS",
      "O_NEG",
    ]),
  }),
});

export const UserValidation = {
    createUserValidationSchema,
    createDonorProfileValidationSchema,
};
