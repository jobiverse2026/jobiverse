export interface Requirement {
  id: string;

  employer_id: string;

  company_id: string | null;

  job_title: string;

  department: string | null;

  employment_type: string | null;

  work_mode: string | null;

  experience: string | null;

  vacancies: number;

  budget_ctc: string | null;

  location: string | null;

  notice_period: string | null;

  skills: string | null;

  education: string | null;

  job_description: string | null;

  status: string;

  priority: string;

  assigned_recruiter: string | null;

  created_at: string;

  updated_at: string;
}