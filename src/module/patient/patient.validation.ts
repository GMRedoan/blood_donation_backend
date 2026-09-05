import z from "zod";

const createRequestValidationSchema = z.object({
  body: z.object({
    requesterType: z.enum(["INDIVIDUAL", "HOSPITAL"]),
    patientName: z.string().min(1, "Patient name is required"),
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
    unitsNeeded: z.number().int().positive("Units needed must be positive"),
    city: z.string().min(1, "City is required"),
    area: z.string().min(1, "Area is required"),
    urgency: z.string().min(1, "Urgency is required"),
    reason: z.string().min(1, "Reason is required"),
  }),
});

export const RequestValidation = {
  createRequestValidationSchema,
};
 
