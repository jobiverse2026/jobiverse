import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="
      flex
      items-center
      gap-3
      transition-opacity
      hover:opacity-90
      "
    >

      {/* Logo Icon */}

      <Image
        src="/images/branding/jobiverse-logo.svg"
        alt="JobiVerse Logo"
        width={44}
        height={44}
        priority
        className="h-11 w-11 shrink-0 object-contain"
      />


      {/* Brand Text */}

      <div
        className="
        flex
        flex-col
        leading-tight
        "
      >

        <span
          className="
          text-xl
          font-extrabold
          tracking-tight
          text-black
          "
        >
          JobiVerse
        </span>


        <span
          className="
          whitespace-nowrap
          text-[9px]
          font-medium
          text-zinc-500
          "
        >
          India's Hiring & Career Platform
        </span>


      </div>


    </Link>
  );
}
