"use client";

import { useForm } from "react-hook-form";

import { PageHeader } from "@/components/common/page-header";

import InputField from "@/components/forms/InputField";
import { submitEmployerRequirement } from "@/actions/employer";

import { zodResolver } from "@hookform/resolvers/zod";
import { employerSchema } from "@/validation/employer";

import type { EmployerRequirement } from "@/types/employer";


export default function EmployerRequirementPage() {

  const {
  register,
  handleSubmit,
  formState: {
    errors,
    isSubmitting,
  },
} = useForm<EmployerRequirement>({
  resolver: zodResolver(employerSchema),
});

async function onSubmit(data: EmployerRequirement) {

  console.log("FORM SUBMITTED");
  console.log(data);

  const result = await submitEmployerRequirement(data);

  console.log(result);

  if (!result.success) {
    alert(result.error);
    return;
  }

  alert("Requirement submitted successfully!");
}

  return (

    <main className="min-h-screen bg-white text-black">


      <PageHeader
        eyebrow="Employer Requirement"
        title="Tell Us Who You're Looking For."
        description="
        Submit your hiring requirement and our recruitment experts
        will connect with you to find the right talent faster.
        "
      />

      <section className="py-20">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <form
  onSubmit={handleSubmit(
    onSubmit,
    (errors) => {
      console.log("VALIDATION ERRORS");
      console.log(errors);
      alert("Validation Failed. Check Console.");
    }
  )}
>

            <div
              className="
              rounded-[32px]
              border
              border-zinc-200
              bg-white
              p-8
              shadow-sm
              lg:p-12
              "
            >

              {/* ===========================
                  COMPANY INFORMATION
              =========================== */}

              <div>

                <h2 className="text-3xl font-bold">
                  Company Information
                </h2>

                <p className="mt-2 text-zinc-600">
                  Tell us about your organization.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-2">

                  <InputField
                    label="Company Name"
                    placeholder="ABC Technologies Pvt Ltd"
                    registration={register("companyName")}
                    error={errors.companyName}
                  />

                  <InputField
                    label="Industry"
                    placeholder="Information Technology"
                    registration={register("industry")}
                    error={errors.industry}
                  />

                  <InputField
                    label="Company Website"
                    placeholder="https://example.com"
                    registration={register("website")}
                    error={errors.website}
                  />

                  <InputField
                    label="Company Size"
                    placeholder="201-500 Employees"
                    registration={register("companySize")}
                    error={errors.companySize}
                  />

                  <InputField
                    label="Company Location"
                    placeholder="Mumbai, Maharashtra"
                    registration={register("companyLocation")}
                    error={errors.companyLocation}
                  />

                  <InputField
                    label="Hiring Location"
                    placeholder="Pune / Bengaluru / Remote"
                    registration={register("hiringLocation")}
                    error={errors.hiringLocation}
                  />

                </div>

              </div>

              <div className="my-16 h-px bg-zinc-200" />

              {/* ===========================
                  CONTACT PERSON
              =========================== */}

              <div>

                <h2 className="text-3xl font-bold">
                  Contact Person
                </h2>

                <p className="mt-2 text-zinc-600">
                  Who should we coordinate with?
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-2">

                  <InputField
                    label="Full Name"
                    placeholder="John Doe"
                    registration={register("fullName")}
                    error={errors.fullName}
                  />

                  <InputField
                    label="Designation"
                    placeholder="HR Manager"
                    registration={register("designation")}
                    error={errors.designation}
                  />

                  <InputField
                    label="Official Email"
                    type="email"
                    placeholder="john@company.com"
                    registration={register("email")}
                    error={errors.email}
                  />

                  <InputField
                    label="Mobile Number"
                    type="tel"
                    placeholder="+91 9876543210"
                    registration={register("phone")}
                    error={errors.phone}
                  />

                </div>

              </div>

              <div className="my-16 h-px bg-zinc-200" />

                              {/* ===========================
                  HIRING REQUIREMENT
              =========================== */}

              <div>

                <h2 className="text-3xl font-bold">
                  Hiring Requirement
                </h2>

                <p className="mt-2 text-zinc-600">
                  Tell us about the position you want to fill.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-2">

                  <InputField
                    label="Job Title"
                    placeholder="Senior React Developer"
                    registration={register("jobTitle")}
                    error={errors.jobTitle}
                  />

                  <InputField
                    label="Department"
                    placeholder="Engineering"
                    registration={register("department")}
                    error={errors.department}
                  />

                  <InputField
                    label="Number of Positions"
                    type="number"
                    placeholder="5"
                    registration={register("openings", {
                      valueAsNumber: true,
                    })}
                    error={errors.openings}
                  />

                  <InputField
                    label="Experience Required"
                    placeholder="3-5 Years"
                    registration={register("experience")}
                    error={errors.experience}
                  />

                  <InputField
                    label="Employment Type"
                    placeholder="Full Time"
                    registration={register("employmentType")}
                    error={errors.employmentType}
                  />

                  <InputField
                    label="Work Mode"
                    placeholder="Onsite / Hybrid / Remote"
                    registration={register("workMode")}
                    error={errors.workMode}
                  />

                  <InputField
                    label="Annual CTC"
                    placeholder="₹8,00,000 - ₹12,00,000"
                    registration={register("salary")}
                    error={errors.salary}
                  />

                  <InputField
                    label="Joining Timeline"
                    placeholder="Immediate / 30 Days"
                    registration={register("joiningTimeline")}
                    error={errors.joiningTimeline}
                  />

                </div>

              </div>

              <div className="my-16 h-px bg-zinc-200" />

              {/* ===========================
                  REQUIRED SKILLS
              =========================== */}

              <div>

                <h2 className="text-3xl font-bold">
                  Required Skills
                </h2>

                <p className="mt-2 text-zinc-600">
                  Mention the key technical and functional skills.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-2">

                  <InputField
                    label="Primary Skills"
                    placeholder="React, Next.js, TypeScript"
                    registration={register("primarySkills")}
                    error={errors.primarySkills}
                  />

                  <InputField
                    label="Secondary Skills"
                    placeholder="Node.js, AWS, Docker"
                    registration={register("secondarySkills")}
                    error={errors.secondarySkills}
                  />

                </div>

              </div>

              <div className="my-16 h-px bg-zinc-200" />

              {/* ===========================
                  JOB DESCRIPTION
              =========================== */}

              <div>

                <h2 className="text-3xl font-bold">
                  Job Description
                </h2>

                <p className="mt-2 text-zinc-600">
                  Share a detailed description of the role.
                </p>

                <textarea
                  rows={8}
                  placeholder="Paste the complete Job Description..."
                  {...register("jobDescription")}
                  className="
                  mt-8
                  w-full
                  rounded-2xl
                  border
                  border-zinc-300
                  p-5
                  outline-none
                  transition
                  focus:border-black
                  focus:ring-4
                  focus:ring-black/5
                  "
                />

              </div>

              <div className="my-16 h-px bg-zinc-200" />

                            {/* ===========================
                  ADDITIONAL INFORMATION
              =========================== */}

              <div>

                <h2 className="text-3xl font-bold">
                  Additional Information
                </h2>

                <p className="mt-2 text-zinc-600">
                  Anything else you'd like our recruitment team to know?
                </p>

                <textarea
                  rows={6}
                  placeholder="Interview process, notice period preference, certifications, relocation, benefits, or any additional hiring information..."
                  {...register("additionalInformation")}
                  className="
                  mt-8
                  w-full
                  rounded-2xl
                  border
                  border-zinc-300
                  p-5
                  outline-none
                  transition
                  focus:border-black
                  focus:ring-4
                  focus:ring-black/5
                  "
                />

              </div>

              <div className="my-16 h-px bg-zinc-200" />

              {/* ===========================
                  JOB DESCRIPTION UPLOAD
              =========================== */}

              <div>

                <h2 className="text-3xl font-bold">
                  Upload Job Description
                </h2>

                <p className="mt-2 text-zinc-600">
                  Upload your JD in PDF or DOCX format (optional).
                </p>

                <label
                  className="
                  mt-8
                  flex
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-3xl
                  border-2
                  border-dashed
                  border-zinc-300
                  bg-zinc-50
                  px-8
                  py-16
                  text-center
                  transition
                  hover:border-black
                  hover:bg-zinc-100
                  "
                >

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />

                  <p className="text-xl font-semibold">
                    Drag & Drop your Job Description
                  </p>

                  <p className="mt-3 text-sm text-zinc-500">
                    or click to browse files
                  </p>

                  <span className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-6 py-3 text-sm font-semibold text-white shadow-lg">
                    Upload JD
                  </span>

                  <p className="mt-6 text-xs uppercase tracking-[0.3em] text-zinc-400">
                    PDF • DOC • DOCX
                  </p>

                </label>

              </div>

              <div className="my-16 h-px bg-zinc-200" />

              {/* ===========================
                  SUBMIT
              =========================== */}

              <div className="text-center">

                <h2 className="text-4xl font-bold">
                  Ready To Hire?
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-zinc-600">
                  Submit your hiring requirement and our recruitment
                  specialists will contact you shortly to begin the hiring
                  process.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                  mt-8
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-black
                  px-8
                  py-4
                  font-semibold
                  text-white
                  transition
                  hover:bg-zinc-800
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  "
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Submit Hiring Requirement"}
                </button>

              </div>

            </div>

          </form>

        </div>

      </section>


    </main>

  );

}
