import { z } from "zod";

const optionalText = z.string().trim().optional();

export const employerSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required"),
  industry: z.string().trim().min(2, "Industry is required"),
  website: optionalText,
  companySize: optionalText,
  companyLocation: z.string().trim().min(2, "Company location is required"),
  hiringLocation: z.string().trim().min(2, "Hiring location is required"),
  fullName: z.string().trim().min(2, "Contact name is required"),
  designation: optionalText,
  email: z.email("Enter a valid work email"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
  jobTitle: z.string().trim().min(2, "Job title is required"),
  department: optionalText,
  openings: optionalText,
  experience: optionalText,
  employmentType: optionalText,
  workMode: optionalText,
  salary: optionalText,
  joiningTimeline: optionalText,
  primarySkills: z.string().trim().min(2, "Primary skills are required"),
  secondarySkills: optionalText,
  jobDescription: z.string().trim().min(10, "Job description is required"),
  additionalInformation: optionalText,
});

export type EmployerRequirementForm = z.infer<typeof employerSchema>;
