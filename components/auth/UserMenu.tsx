"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, UserCircle } from "lucide-react";
import { useRef, useState } from "react";

import { useUser } from "@/hooks/useUser";
import LogoutButton from "@/components/auth/LogoutButton";


export default function UserMenu() {

  const {
    user,
    profile,
    role,
    loading,
  } = useUser();


  const [open, setOpen] = useState(false);
  const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const keepOpen=()=>{if(closeTimer.current)clearTimeout(closeTimer.current);closeTimer.current=null;};
  const closeDelayed=()=>{keepOpen();closeTimer.current=setTimeout(()=>setOpen(false),250);};



  if (loading) {
    return (
      <div className="h-10 w-32 animate-pulse rounded-xl bg-zinc-100" />
    );
  }



  if (!user) {
    return null;
  }



  const dashboardLink = "/dashboard";



  return (
    <div className="relative" onMouseEnter={keepOpen} onMouseLeave={closeDelayed}>

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-zinc-100"
      >

        {profile?.avatar_url ? (

          <Image
            src={profile.avatar_url}
            alt="Profile"
            width={36}
            height={36}
            unoptimized
            className="h-9 w-9 rounded-full object-cover"
          />

        ) : (

          <UserCircle
            size={36}
            className="text-zinc-600"
          />

        )}



        <div className="hidden text-left sm:block">

          <p className="text-sm font-semibold text-zinc-900">
            {profile?.full_name ||
              user.email}
          </p>


          <p className="text-xs capitalize text-zinc-500">
            {role || "User"}
          </p>

        </div>



        <ChevronDown
          size={16}
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />

      </button>



      {open && (

        <div
          onMouseEnter={keepOpen}
          onMouseLeave={closeDelayed}
          className="absolute right-0 mt-3 w-64 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl"
        >

          <div className="mb-3 border-b border-zinc-100 pb-3">

            <p className="font-semibold text-zinc-900">
              {profile?.full_name ||
                "User"}
            </p>


            <p className="text-sm text-zinc-500">
              {user.email}
            </p>

          </div>



          <Link
            href={dashboardLink}
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-zinc-100"
          >
            Dashboard
          </Link>



          <Link
            href="/account/profile"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-zinc-100"
          >
            Update Profile
          </Link>

          {role === "candidate" && <Link
            href="/candidates/profile"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-zinc-100"
          >
            Professional Profile
          </Link>}

          {role === "candidate" && <Link
            href="/career-passport"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-zinc-100"
          >
            JobiVerse Card
          </Link>}

          <Link
            href="/account/billing"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-zinc-100"
          >
            Billing & Purchases
          </Link>

          <Link
            href="/account/notifications"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-zinc-100"
          >
            Notification Preferences
          </Link>

          <Link
            href="/account/security"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-zinc-100"
          >
            Security & Change Password
          </Link>

          <Link
            href="/account/privacy"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-zinc-100"
          >
            Data & Privacy Centre
          </Link>



          <div className="mt-2 border-t border-zinc-100 pt-2">

            <LogoutButton />

          </div>


        </div>

      )}

    </div>
  );

}
