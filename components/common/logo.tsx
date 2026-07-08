import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
        J
      </div>

      <div className="leading-none">
        <p className="text-lg font-bold tracking-tight">
          JobiVerse
        </p>
        <p className="text-xs text-muted-foreground">
          From Beginners to Bosses
        </p>
      </div>
    </Link>
  );
}