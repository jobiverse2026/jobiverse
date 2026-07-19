"use client";

import { useForm } from "react-hook-form";

import FormInput from "../common/FormInput";

import type { EmployerRequirement } from "@/types/employer";

export default function EmployerRequirementForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployerRequirement>();

  async function onSubmit(data: EmployerRequirement) {
    console.log(data);

    // Next Step
    // await submitEmployerRequirement(data)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-16"
    >
      {/* ========================= */}
      {/* COMPANY INFORMATION */}
      {/* ========================= */}

      <section>

        <h2 className="text-3xl font-bold">
          Company Information
        </h2>

        <p className="mt-2 text-zinc-600">
          Tell us about your organization.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <FormInput
            label="Company Name"
            placeholder="ABC Technologies Pvt Ltd"
            registration={register("companyName")}
            error={errors.companyName}
          />

          <FormInput
            label="Industry"
            placeholder="Information Technology"
            registration={register("industry")}
            error={errors.industry}
          />

          <FormInput
            label="Website"
            placeholder="https://company.com"
            registration={register("website")}
            error={errors.website}
          />

          <FormInput
            label="Company Size"
            placeholder="200-500 Employees"
            registration={register("companySize")}
            error={errors.companySize}
          />

          <FormInput
            label="Company Location"
            placeholder="Mumbai"
            registration={register("companyLocation")}
            error={errors.companyLocation}
          />

          <FormInput
            label="Hiring Location"
            placeholder="Pune"
            registration={register("hiringLocation")}
            error={errors.hiringLocation}
          />

        </div>

      </section>

      {/* ========================= */}
      {/* CONTACT PERSON */}
      {/* ========================= */}

      <section>

        <h2 className="text-3xl font-bold">
          Contact Person
        </h2>

        <p className="mt-2 text-zinc-600">
          Our recruitment team will coordinate with this person.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <FormInput
            label="Full Name"
            placeholder="John Smith"
            registration={register("fullName")}
            error={errors.fullName}
          />

          <FormInput
            label="Designation"
            placeholder="HR Manager"
            registration={register("designation")}
            error={errors.designation}
          />

          <FormInput
            label="Official Email"
            type="email"
            placeholder="hr@company.com"
            registration={register("email")}
            error={errors.email}
          />

          <FormInput
            label="Phone Number"
            type="tel"
            placeholder="+91 9876543210"
            registration={register("phone")}
            error={errors.phone}
          />

        </div>

      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className="
        rounded-2xl
        bg-black
        px-8
        py-4
        font-semibold
        text-white
        transition
        hover:bg-zinc-800
        disabled:opacity-50
        "
      >
        {isSubmitting ? "Submitting..." : "Continue"}
      </button>

    </form>
  );
}