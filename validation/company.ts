import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return "";
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  })
  .pipe(z.union([z.literal(""), z.url("Enter a valid website address")]));

export const companySchema = z.object({
  company_name: z.string().min(2),

  company_email: z.string().email().optional().or(z.literal("")),

  phone: z.string().optional(),

  website: optionalUrl,

  industry: z.string().optional(),

  company_size: z.string().optional(),

  gst_number: z.string().optional(),

  address: z.string().optional(),

  city: z.string().optional(),

  state: z.string().optional(),

  country: z.string().optional(),

  pincode: z.string().optional(),

  linkedin_url: optionalUrl,

  description: z.string().optional(),
});

export type CompanyFormData =
  z.infer<typeof companySchema>;
