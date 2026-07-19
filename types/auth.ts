export type UserRole =
  | "admin"
  | "recruiter"
  | "candidate"
  | "employer"
  | "creator";


export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone?: string | null;
  role: UserRole | null;
  created_at?: string;
  updated_at?: string;
}
