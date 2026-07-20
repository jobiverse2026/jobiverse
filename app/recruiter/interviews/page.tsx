import { requireRole } from "@/lib/auth/authorization";
import { ensureTodayInterviewRemindersForUser, getRecruiterUpcomingInterviews } from "@/lib/hiring/interview-calendar";
import { InterviewCalendarView } from "@/components/hiring/InterviewCalendarView";

export default async function RecruiterInterviewsPage() {
  const { user } = await requireRole(["recruiter"]);
  const interviews = await getRecruiterUpcomingInterviews(user.id);
  await ensureTodayInterviewRemindersForUser(user.id, interviews);
  return <InterviewCalendarView interviews={interviews} role="recruiter" />;
}
