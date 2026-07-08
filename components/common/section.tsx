import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
};

export function Section({
  children,
  className,
}: SectionProps) {
  return (
    <section
      className={cn(
        "py-16 sm:py-20 lg:py-28",
        className
      )}
    >
      {children}
    </section>
  );
}