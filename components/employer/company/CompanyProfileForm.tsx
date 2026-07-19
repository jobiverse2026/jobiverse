"use client";

import { useState } from "react";
import { updateCompany } from "@/actions/company";
import type { Company } from "@/types/company";

export default function CompanyProfileForm({
  company,
}: {
  company: Company | null;
}) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    company_name: company?.company_name ?? "",
    company_email: company?.company_email ?? "",
    phone: company?.phone ?? "",
    website: company?.website ?? "",
    industry: company?.industry ?? "",
    company_size: company?.company_size ?? "",
    address: company?.address ?? "",
    city: company?.city ?? "",
    state: company?.state ?? "",
    country: company?.country ?? "India",
    pincode: company?.pincode ?? "",
    linkedin_url: company?.linkedin_url ?? "",
    description: company?.description ?? "",
  });

  function updateField(
    key: string,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function normalizeUrlField(key: "website" | "linkedin_url") {
    const value = form[key].trim();
    if (value && !/^https?:\/\//i.test(value)) {
      updateField(key, `https://${value}`);
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
  await updateCompany(form);

  alert("Company profile saved successfully.");
} catch (err) {
  console.error(err);
  alert("Failed to save company profile.");
}

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative space-y-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_30px_100px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl md:p-10"
    >      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Company Name
          </label>
          <input
            type="text"
            value={form.company_name}
            onChange={(e) =>
              updateField("company_name", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Company Email
          </label>
          <input
            type="email"
            value={form.company_email}
            onChange={(e) =>
              updateField("company_email", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Phone
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) =>
              updateField("phone", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Website
          </label>
          <input
            type="text"
            inputMode="url"
            placeholder="www.company.com"
            value={form.website}
            onChange={(e) =>
              updateField("website", e.target.value)
            }
            onBlur={() => normalizeUrlField("website")}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Industry
          </label>
          <input
            type="text"
            value={form.industry}
            onChange={(e) =>
              updateField("industry", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Company Size
          </label>
          <input
            type="text"
            value={form.company_size}
            onChange={(e) =>
              updateField("company_size", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) =>
              updateField("address", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            City
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) =>
              updateField("city", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            State
          </label>
          <input
            type="text"
            value={form.state}
            onChange={(e) =>
              updateField("state", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Country
          </label>
          <input
            type="text"
            value={form.country}
            onChange={(e) =>
              updateField("country", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Pincode
          </label>
          <input
            type="text"
            value={form.pincode}
            onChange={(e) =>
              updateField("pincode", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            LinkedIn URL
          </label>
          <input
            type="text"
            inputMode="url"
            placeholder="linkedin.com/company/your-company"
            value={form.linkedin_url}
            onChange={(e) =>
              updateField("linkedin_url", e.target.value)
            }
            onBlur={() => normalizeUrlField("linkedin_url")}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Company Description
          </label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) =>
              updateField("description", e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
