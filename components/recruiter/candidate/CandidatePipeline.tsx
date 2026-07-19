"use client";

import { useState } from "react";

import {
  DndContext,
  closestCorners,
  DragEndEvent,
} from "@dnd-kit/core";

import PipelineColumn from "./PipelineColumn";

import { updateCandidateStatus } from "@/actions/candidate-status";

import type {
  Candidate,
  CandidateStatus,
} from "@/types/candidate";

type Props = {
  candidates: Candidate[];
};

const stages: CandidateStatus[] = [
  "Submitted",
  "Screening",
  "Client Submitted",
  "Interview",
  "Selected",
  "Offered",
  "Joined",
  "Rejected",
];

const manuallyMovableStages: CandidateStatus[] = [
  "Submitted", "Screening", "Client Submitted", "Interview", "Selected", "Rejected",
];

export default function CandidatePipeline({
  candidates,
}: Props) {
  const [pipelineCandidates, setPipelineCandidates] =
    useState<Candidate[]>(candidates);

  const [isUpdating, setIsUpdating] =
    useState(false);

  async function handleDragEnd(
    event: DragEndEvent
  ) {
    const { active, over } = event;

    if (!over) return;

    const candidateId = String(active.id);

    const newStatus =
      String(over.id) as CandidateStatus;

    if (!manuallyMovableStages.includes(newStatus)) {
      return;
    }

    const previousCandidates =
      [...pipelineCandidates];

    const candidate =
      pipelineCandidates.find(
        (c) => c.id === candidateId
      );

    if (!candidate) return;

    if (candidate.status === newStatus) {
      return;
    }

    // -----------------------------
    // Optimistic UI
    // -----------------------------

    setPipelineCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              status: newStatus,
            }
          : c
      )
    );

    try {
      setIsUpdating(true);

      await updateCandidateStatus(
        candidateId,
        newStatus
      );
    } catch (error) {
      console.error(error);

      // Rollback if failed

      setPipelineCandidates(
        previousCandidates
      );

      alert(
        "Unable to update candidate status."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-4">
      {isUpdating && (
        <div
          className="
          rounded-xl
          border
          border-zinc-200
          bg-zinc-100
          px-4
          py-2
          text-sm
          text-zinc-600
          "
        >
          Updating candidate...
        </div>
      )}

      <DndContext
        collisionDetection={
          closestCorners
        }
        onDragEnd={handleDragEnd}
      >
        <div
          className="
          grid
          gap-6
          xl:grid-cols-4
          2xl:grid-cols-8
          "
        >
          {stages.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              candidates={pipelineCandidates.filter(
                (candidate) =>
                  candidate.status === stage
              )}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
