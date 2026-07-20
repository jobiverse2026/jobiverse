"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";

import MobileNav from "./MobileNav";
import NavDropdown from "./NavDropdown";
import LoginDropdown from "./LoginDropdown";
import { marketplaceNavigation, publicNavigation, roleNavigation } from "./nav-data";
import UserMenu from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useUser } from "@/hooks/useUser";
import type { UserRole } from "@/types/auth";

const CLOSE_DELAY = 200;

export function Navbar() {
  const pathname = usePathname();
  const sidebarWorkspace = pathname.startsWith("/admin") || pathname.startsWith("/recruiter");
  if (sidebarWorkspace) return null;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // SINGLE source of truth for whichever menu is open.
  // Either a nav item's title, "login", or null.
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // One shared timer for the close-debounce, so there's never
  // more than one dropdown fighting to open/close at once.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user, role, loading } = useUser();
  const metadataRole = user?.user_metadata?.role;
  const stableRole: UserRole | null = role ??
    (["admin", "recruiter", "candidate", "employer", "creator"].includes(metadataRole)
      ? (metadataRole as UserRole)
      : null);

  const activeNavigation = pathname.startsWith("/earn-with-jobiverse/dashboard")
    ? roleNavigation.creator
    : stableRole
      ? roleNavigation[stableRole]
      : pathname.startsWith("/marketplace")
        ? marketplaceNavigation
        : publicNavigation;

  const dashboardHref = pathname.startsWith("/earn-with-jobiverse/dashboard")
    ? "/earn-with-jobiverse/dashboard"
    : stableRole === "admin"
      ? "/admin"
      : stableRole === "recruiter"
        ? "/recruiter"
        : stableRole === "employer"
          ? "/employers/dashboard"
          : stableRole === "creator"
            ? "/earn-with-jobiverse/dashboard"
            : "/candidates/dashboard";


  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openNow = (key: string) => {
    clearCloseTimer();
    setOpenMenu(key);
  };

  const closeWithDelay = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setOpenMenu(null);
    }, CLOSE_DELAY);
  };

  // Close everything on route change.
  useEffect(() => {
    const routeTimer=window.setTimeout(()=>{setOpenMenu(null);setMobileOpen(false);},0);
    return()=>window.clearTimeout(routeTimer);
  }, [pathname]);

  // Scroll shadow.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  // Cleanup any pending timer on unmount.
  useEffect(() => clearCloseTimer, []);

  return (
    <header data-site-navbar className="fixed left-0 right-0 top-4 z-50 px-4 transition-all duration-500">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative flex h-20 items-center justify-between overflow-visible rounded-[1.75rem] border border-white/75 bg-white/72 px-5 backdrop-blur-2xl transition-all duration-500 before:pointer-events-none before:absolute before:inset-x-16 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/25 before:to-transparent xl:px-6 ${
            scrolled ? "shadow-[0_24px_70px_-30px_rgba(15,23,42,.38)] ring-1 ring-black/5" : "shadow-[0_18px_55px_-34px_rgba(15,23,42,.4)]"
          }`}
        >
          {/* LOGO */}
          <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 0.2 }}>
            <Logo />
          </motion.div>

         {/* DESKTOP NAVIGATION */}
{/* DESKTOP NAVIGATION */}
<nav className="ml-4 hidden items-center gap-0 xl:flex">
  {!loading && activeNavigation.map((item) => {
    const itemPath = item.href?.split(/[?#]/)[0];
    const isActive = Boolean(itemPath && (pathname === itemPath || (itemPath !== "/" && pathname.startsWith(`${itemPath}/`))));
    const isOpen = openMenu === item.title;

    return (
      <div
        key={item.title}
        className="relative"
        onMouseEnter={() =>
          item.children && openNow(item.title)
        }
        onMouseLeave={() =>
          item.children && closeWithDelay()
        }
      >
        <Link
          href={item.href ?? "#"}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-2.5 text-[13px] font-medium transition-all duration-300 ${
            isActive
              ? "bg-gradient-to-r from-black via-zinc-800 to-zinc-600 text-white shadow-md shadow-black/20"
              : "text-zinc-700 hover:bg-violet-50 hover:text-violet-800"
          }`}
        >
          {item.title}

          {item.children && (
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </Link>


        <AnimatePresence>
          {item.children && isOpen && (
            <NavDropdown
              items={item.children}
              onItemClick={() =>
                setOpenMenu(null)
              }
            />
          )}
        </AnimatePresence>

      </div>
    );
  })}
</nav>

         <div className="hidden items-center gap-1 xl:flex">

  {/* AUTH AREA */}

  {loading ? (

    <div className="h-10 w-24 animate-pulse rounded-xl bg-zinc-100" />

  ) : user ? (
    <><NotificationBell userId={user.id} /><UserMenu /></>

  ) : (
    <div className="flex items-center gap-1">
    <div className="relative" onMouseEnter={() => openNow("signup")} onMouseLeave={closeWithDelay}>
      <button className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-[13px] font-medium text-zinc-700 transition hover:bg-zinc-100">Sign up<ChevronDown size={16} className={`transition-transform ${openMenu === "signup" ? "rotate-180" : ""}`}/></button>
      <AnimatePresence>{openMenu === "signup" && <LoginDropdown mode="signup" onItemClick={() => setOpenMenu(null)}/>}</AnimatePresence>
    </div>
    <div
      className="relative"
      onMouseEnter={() => openNow("login")}
      onMouseLeave={closeWithDelay}
    >

      <button
        className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-[13px] font-medium text-zinc-700 transition-all duration-300 hover:bg-zinc-100"
      >
        Login

        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${
            openMenu === "login"
              ? "rotate-180"
              : ""
          }`}
        />
      </button>


      <AnimatePresence>
        {openMenu === "login" && (
          <LoginDropdown
            mode="login"
            onItemClick={() => setOpenMenu(null)}
          />
        )}
      </AnimatePresence>


    </div>
    </div>

  )}



</div>

          {/* MOBILE ACTIONS */}
          <div className="flex items-center xl:hidden">
            {user && <NotificationBell userId={user.id} />}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-panel"
              className="rounded-xl p-3 transition hover:bg-zinc-100"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* MOBILE NAVIGATION */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm xl:hidden"
                onClick={() => setMobileOpen(false)}
              >
                <motion.div
                  id="mobile-navigation-panel"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute right-0 top-0 flex h-screen w-[min(92vw,340px)] flex-col border-l border-zinc-200 bg-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-zinc-200 p-6">
                    <Logo />
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Close navigation menu"
                      className="rounded-xl p-2 hover:bg-zinc-100"
                    >
                      <X size={22} />
                    </button>
                  </div>

              <MobileNav onClose={() => setMobileOpen(false)} authenticated={!!user} dashboardHref={dashboardHref} role={stableRole} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Container>
    </header>
  );
}
