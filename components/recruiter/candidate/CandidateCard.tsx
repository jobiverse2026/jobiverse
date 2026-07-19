"use client";

import Link from "next/link";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Candidate } from "@/types/candidate";

type Props = {
  candidate: Candidate;
};

export default function CandidateCard({
  candidate,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: candidate.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="
        cursor-grab
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-4
        shadow-sm
        transition
        hover:shadow-md
        active:cursor-grabbing
      "
    >
      {/* Candidate Name */}

      <Link
        href={`/recruiter/candidates/${candidate.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block text-base font-semibold hover:underline"
      >
        {candidate.full_name}
      </Link>

      {/* Email */}

      {candidate.email && (
        <p className="mt-1 text-sm text-zinc-500 truncate">
          {candidate.email}
        </p>
      )}

      {/* Experience */}

      {candidate.total_experience && (
        <p className="mt-3 text-sm">
          <span className="text-zinc-500">Experience:</span>{" "}
          <span className="font-medium">
            {candidate.total_experience}
          </span>
        </p>
      )}

      {/* Skills */}

      {candidate.primary_skills && (
        <p className="mt-2 text-sm">
          <span className="text-zinc-500">Skills:</span>{" "}
          <span className="font-medium">
            {candidate.primary_skills}
          </span>
        </p>
      )}

      {/* Current Company */}

      {candidate.current_company && (
        <p className="mt-2 text-sm">
          <span className="text-zinc-500">Company:</span>{" "}
          <span className="font-medium">
            {candidate.current_company}
          </span>
        </p>
      )}

      {/* Requirement */}

      {candidate.requirements?.job_title && (
        <p className="mt-2 text-sm">
          <span className="text-zinc-500">Role:</span>{" "}
          <span className="font-medium">
            {candidate.requirements.job_title}
          </span>
        </p>
      )}

      {/* Resume */}

      {candidate.resume_url && (
        <a
          href={candidate.resume_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="
            mt-4
            inline-flex
            rounded-lg
            border
            border-zinc-300
            px-3
            py-2
            text-sm
            font-medium
            hover:bg-zinc-100
          "
        >
          View Resume
        </a>
      )}
    </div>
  );
}
