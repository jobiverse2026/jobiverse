import { requireRole } from "@/lib/auth/authorization";
import { ensureTodayInterviewRemindersForUser, getEmployerUpcomingInterviews } from "@/lib/hiring/interview-calendar";
import { InterviewCalendarView } from "@/components/hiring/InterviewCalendarView";

export default async function EmployerInterviewsPage() {
  const { user } = await requireRole(["employer"]);
  const interviews = await getEmployerUpcomingInterviews(user.id);
  await ensureTodayInterviewRemindersForUser(user.id, interviews);
  return <InterviewCalendarView interviews={interviews} role="employer" />;
}
