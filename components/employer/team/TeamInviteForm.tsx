"use client";

import { Mail, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { inviteEmployerRecruiter } from "@/app/employers/team/actions";

export function TeamInviteForm({
  employerSeatsLeft,
  recruiterSeatsLeft,
}: {
  employerSeatsLeft: number;
  recruiterSeatsLeft: number;
}) {
  const [emails, setEmails] = useState([""]);

  const addEmail = () => setEmails((items) => [...items, ""]);
  const removeEmail = (index: number) => setEmails((items) => items.filter((_, itemIndex) => itemIndex !== index));
  const updateEmail = (index: number, value: string) =>
    setEmails((items) => items.map((item, itemIndex) => (itemIndex === index ? value : item)));

  return (
    <form action={inviteEmployerRecruiter} className="rounded-[2rem] border bg-white p-7 shadow-sm">
      <Mail className="text-zinc-400" />
      <h2 className="mt-5 text-2xl font-semibold">Invite by email</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        Add one or more exact email IDs. No email delivery is required — invited users can sign up or log in with the same email and access only the assigned portal.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-semibold">
          <input type="radio" name="inviteRole" value="employer" className="mr-2" />
          Employer access
          <span className="mt-1 block text-xs font-normal text-zinc-500">{employerSeatsLeft} seats left</span>
        </label>
        <label className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-semibold">
          <input type="radio" name="inviteRole" value="recruiter" defaultChecked className="mr-2" />
          Recruiter access
          <span className="mt-1 block text-xs font-normal text-zinc-500">{recruiterSeatsLeft} seats left</span>
        </label>
      </div>

      <div className="mt-5 space-y-3">
        {emails.map((email, index) => (
          <div key={index} className="flex gap-2">
            <input
              name="emails"
              type="email"
              required={index === 0}
              value={email}
              onChange={(event) => updateEmail(index, event.target.value)}
              placeholder={index === 0 ? "person@company.com" : "another@company.com"}
              className="h-13 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-zinc-500"
            />
            {emails.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmail(index)}
                className="grid h-13 w-13 shrink-0 cursor-pointer place-items-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                aria-label="Remove email"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEmail}
        className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
      >
        <Plus size={16} />
        Add another email
      </button>

      <button className="mt-4 w-full cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white">
        Give portal access
      </button>
    </form>
  );
}
