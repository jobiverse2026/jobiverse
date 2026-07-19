"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ArrowRight,
} from "lucide-react";

import {
  publicNavigation,
  roleNavigation,
  loginMenu,
  signupMenu,
} from "./nav-data";
import type { UserRole } from "@/types/auth";


interface MobileNavProps {
  onClose: () => void;
  authenticated?: boolean;
  dashboardHref?: string;
  role?: UserRole | null;
}


export default function MobileNav({
  onClose,
  authenticated = false,
  dashboardHref = "/",
  role = null,
}: MobileNavProps) {


  const [openMenu,setOpenMenu] =
    useState<string | null>(null);
  const pathname = usePathname();
  const dashboardLabel = pathname.startsWith("/earn-with-jobiverse/dashboard") || role === "creator"
    ? "Open Creator Dashboard"
    : role === "employer"
      ? "Open Employer Dashboard"
      : role === "recruiter"
        ? "Open Recruiter Dashboard"
        : role === "admin"
          ? "Open Admin Dashboard"
          : "Open Candidate Dashboard";


  return (

    <div
      className="
      flex
      flex-1
      flex-col
      overflow-y-auto
      p-6
      "
    >


      {/* Main Navigation */}

      <div
        className="
        flex
        flex-col
        gap-2
        "
      >

        {!authenticated && <div className="mb-4 rounded-2xl bg-zinc-950 p-2 text-white"><p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Sign up</p>{signupMenu.map(item=><Link key={item.title} href={item.href} onClick={onClose} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-white/10">{item.title}<ArrowRight size={15}/></Link>)}</div>}

        {
          (pathname.startsWith("/earn-with-jobiverse/dashboard") ? roleNavigation.creator : role ? roleNavigation[role] : publicNavigation).map((item)=>(

            <div
              key={item.title}
              className="
              border-b
              border-zinc-100
              pb-2
              "
            >


              {
                item.children ? (

                  <>

                    <button

                      onClick={()=>
                        setOpenMenu(
                          openMenu === item.title
                          ? null
                          : item.title
                        )
                      }

                      className="
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      px-4
                      py-3
                      text-left
                      font-medium
                      text-zinc-800
                      hover:bg-zinc-100
                      "
                    >

                      {item.title}


                      <ChevronDown

                        size={18}

                        className={`
                        transition-transform
                        ${
                          openMenu === item.title
                          ? "rotate-180"
                          : ""
                        }
                        `}
                      />

                    </button>



                    {
                      openMenu === item.title && (

                        <div
                          className="
                          ml-4
                          mt-2
                          flex
                          flex-col
                          gap-1
                          "
                        >

                          {
                            item.children.map(
                              (child)=>(

                                <Link

                                  key={child.title}

                                  href={child.href}

                                  onClick={onClose}

                                  className="
                                  rounded-lg
                                  px-4
                                  py-2
                                  text-sm
                                  text-zinc-600
                                  hover:bg-zinc-100
                                  "
                                >

                                  {child.title}

                                </Link>

                              )
                            )
                          }

                        </div>

                      )
                    }

                  </>


                ) : (

                  <Link

                    href={item.href ?? "#"}

                    onClick={onClose}

                    className="
                    block
                    rounded-xl
                    px-4
                    py-3
                    font-medium
                    text-zinc-800
                    hover:bg-zinc-100
                    "
                  >

                    {item.title}

                  </Link>

                )
              }


            </div>

          ))
        }


      </div>



      {/* Login Section */}

      {!authenticated && <div
        className="
        mt-8
        border-t
        border-zinc-200
        pt-6
        "
      >

        <p
          className="
          mb-3
          px-4
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-zinc-400
          "
        >
          Login
        </p>


        {
          loginMenu.map((item)=>(

            <Link

              key={item.title}

              href={item.href}

              onClick={onClose}

              className="
              flex
              items-center
              justify-between
              rounded-xl
              px-4
              py-3
              text-zinc-700
              hover:bg-zinc-100
              "
            >

              {item.title}


              <ArrowRight
                size={16}
              />

            </Link>

          ))
        }


      </div>}



      {/* CTA */}

      {authenticated && (
        <Link href={dashboardHref} onClick={onClose} className="mb-3 mt-8 flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-6 py-4 font-semibold text-zinc-900">
          {dashboardLabel} <ArrowRight className="ml-2" size={18} />
        </Link>
      )}

    </div>

  );

}
