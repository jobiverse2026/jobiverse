export type CandidateStatus =
  | "Submitted"
  | "Screening"
  | "Client Submitted"
  | "Interview"
  | "Selected"
  | "Offered"
  | "Joined"
  | "Rejected"
  | "Withdrawn";

export interface JobRequirement {
  job_title: string;
}

export interface Candidate {
  id: string;

  full_name: string;

  email: string | null;

  phone: string | null;

  current_location: string | null;

  total_experience: string | null;

  current_company: string | null;

  current_ctc: string | null;

  expected_ctc: string | null;

  notice_period: string | null;

  primary_skills: string | null;

  secondary_skills: string | null;

  linkedin: string | null;

  resume_path: string | null;
  resume_url?: string | null;

  remarks: string | null;

  recruiter_id: string | null;

  requirement_id: string | null;

  created_at: string;

  status: CandidateStatus;

  requirements?: JobRequirement;
}
