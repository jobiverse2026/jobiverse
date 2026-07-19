"use client";

import {
  useDroppable,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import CandidateCard from "./CandidateCard";

import type { Candidate } from "@/types/candidate";

type Props = {
  stage: string;
  candidates: Candidate[];
};

export default function PipelineColumn({
  stage,
  candidates,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[650px]
        rounded-3xl
        border
        transition-all
        p-4
        ${
          isOver
            ? "border-black bg-zinc-200"
            : "border-zinc-200 bg-zinc-100"
        }
      `}
    >
      {/* Header */}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {stage}
        </h2>

        <span
          className="
            rounded-full
            bg-white
            px-3
            py-1
            text-xs
            font-semibold
            shadow-sm
          "
        >
          {candidates.length}
        </span>
      </div>

      {/* Cards */}

      <SortableContext
        items={candidates.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {candidates.length === 0 ? (
            <div
              className="
                rounded-2xl
                border-2
                border-dashed
                border-zinc-300
                p-6
                text-center
                text-sm
                text-zinc-500
              "
            >
              Drop candidate here
            </div>
          ) : (
            candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}