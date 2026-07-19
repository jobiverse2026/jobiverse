import { z } from "zod";

export const requirementSchema = z.object({
  job_title: z
    .string()
    .min(2, "Job title is required"),

  department: z.string().optional(),

  employment_type: z.string().optional(),

  work_mode: z.string().optional(),

  experience: z.string().optional(),

  vacancies: z.coerce
    .number()
    .min(1, "Minimum 1 vacancy required"),

  budget_ctc: z.string().optional(),

  location: z.string().optional(),

  notice_period: z.string().optional(),

  skills: z.string().optional(),

  education: z.string().optional(),

  job_description: z.string().optional(),

  priority: z
    .enum(["Low", "Normal", "High", "Urgent"])
    .default("Normal"),

  assign_to_jobiverse: z.boolean().default(false),

  publish_to_jobs: z.boolean().default(false),
});

export type RequirementFormData =
  z.infer<typeof requirementSchema>;
