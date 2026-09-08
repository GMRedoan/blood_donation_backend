import z from "zod";

const createCampaignValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    targetAmount: z.number().int().positive("Target amount must be positive"),
    requestId: z.string().optional(),
  }),
});

export const CampaignValidation = {
  createCampaignValidationSchema,
};
