export interface Company {
  id: string;

  owner_id: string;

  company_name: string;

  company_email: string | null;

  phone: string | null;

  website: string | null;

  industry: string | null;

  company_size: string | null;

  gst_number: string | null;

  address: string | null;

  city: string | null;

  state: string | null;

  country: string | null;

  pincode: string | null;

  logo_url: string | null;

  linkedin_url: string | null;

  description: string | null;

  is_verified: boolean;

  created_at: string;

  updated_at: string;
}