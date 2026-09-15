"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { label: "Product", href: "/product" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/docs" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();
  const router = useRouter();

  const isAuthPage =
    pathName === "/register" ||
    pathName === "/login" ||
    pathName === "/auth/register" ||
    pathName === "/auth/login" ||
    pathName === "/auth/forget-password" ||
    pathName === "/auth/reset-password";

  const isDashboard = pathName.startsWith("/dashboard");
const handleSignOut = async () => {
  await fetch("/api/auth", {
    method: "POST",
      body: JSON.stringify({
          action: "logout",
        }),
      });


  router.replace("/auth/login");
};

  return (
    <header className="border-b border-[var(--mist)] bg-white">
      <div
        className={`mx-auto flex max-w-[1160px] items-center px-6 py-3 md:px-10 ${
          isAuthPage ? "justify-center" : "justify-between"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="block h-[9px] w-[9px] -translate-y-[1px] rounded-[2px] bg-[var(--amber)]" />

          <span
            className="text-[22px] font-semibold tracking-tight text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Flowboard
          </span>
        </Link>

        {/* Auth page tagline */}
        {isAuthPage && (
          <p className="ml-12 justify-center text-gray-400">
            A place to catch ideas
          </p>
        )}

        {/* Header navigation */}
        {!isAuthPage && (
          <>
            {/* Dashboard navigation */}
            {isDashboard ? (
              <>
                {/* Desktop */}
                <nav className="hidden items-center gap-8 md:flex">
                   <Link
                    href="/dashboard/workspace"
                    className="text-[15px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                  >
                    Workspace
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-[15px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                  >
                    Board
                  </Link>

                  <Link
                    href="/dashboard/inbox"
                    className="text-[15px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                  >
                    Inbox
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-[7px] bg-[var(--ink)] px-[18px] py-[9px] text-sm font-medium text-[var(--paper)] transition-opacity hover:opacity-90"
                  >
                    Sign out
                  </button>
                </nav>

                {/* Mobile */}
                <button
                  type="button"
                  aria-label={open ? "Close menu" : "Open menu"}
                  aria-expanded={open}
                  onClick={() => setOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--ink)] md:hidden"
                >
                  {open ? <X size={22} /> : <Menu size={22} />}
                </button>
              </>
            ) : (
              <>
                {/* Public navigation */}
                <nav className="hidden items-center gap-9 md:flex">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-[15px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <Link
                    href="/auth/login"
                    className="text-[15px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/auth/register"
                    className="rounded-[7px] bg-[var(--ink)] px-[18px] py-[9px] text-sm font-medium text-[var(--paper)] transition-opacity hover:opacity-90"
                  >
                    Start free
                  </Link>
                </nav>

                {/* Mobile menu button */}
                <button
                  type="button"
                  aria-label={open ? "Close menu" : "Open menu"}
                  aria-expanded={open}
                  onClick={() => setOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--ink)] md:hidden"
                >
                  {open ? <X size={22} /> : <Menu size={22} />}
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Mobile dashboard menu */}
      {!isAuthPage && isDashboard && open && (
        <nav className="flex flex-col gap-1 border-t border-[var(--mist)] px-6 py-4 md:hidden">
          <Link
                    href="/dashboard/workspace"
                    className="text-[15px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                  >
                    Workspace
                  </Link>
          
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-2.5 text-[15px] text-[var(--ink-soft)] hover:bg-[var(--paper-raised)] hover:text-[var(--ink)]"
          >
            Board
          </Link>

          <Link
            href="/dashboard/inbox"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-2.5 text-[15px] text-[var(--ink-soft)] hover:bg-[var(--paper-raised)] hover:text-[var(--ink)]"
          >
            Inbox
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-2 rounded-[7px] bg-[var(--ink)] px-[18px] py-[10px] text-center text-sm font-medium text-[var(--paper)]"
          >
            Sign out
          </button>
        </nav>
      )}

      {/* Mobile public menu */}
      {!isAuthPage && !isDashboard && open && (
        <nav className="flex flex-col gap-1 border-t border-[var(--mist)] px-6 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-[15px] text-[var(--ink-soft)] hover:bg-[var(--paper-raised)] hover:text-[var(--ink)]"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/auth/login"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-2.5 text-[15px] text-[var(--ink-soft)] hover:bg-[var(--paper-raised)] hover:text-[var(--ink)]"
          >
            Sign in
          </Link>

          <Link
            href="/auth/register"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-[7px] bg-[var(--ink)] px-[18px] py-[10px] text-center text-sm font-medium text-[var(--paper)]"
          >
            Start free
          </Link>
        </nav>
      )}
    </header>
  );
}