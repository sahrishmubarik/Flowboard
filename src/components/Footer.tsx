"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
const footerLinks = {
  Product: [
    { label: "Features", href: "/product" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  Resources: [
    { label: "Docs", href: "/docs" },
    { label: "Support", href: "/support" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();
  const pathName = usePathname();
  
    const isAuthPage =
      pathName === "/register" ||
      pathName === "/login" ||
      pathName === "/auth/register" ||
      pathName === "/auth/login";
  

  return (
    <footer className=" bg-[var(--paper-raised)]">
      <div>
        {!isAuthPage &&
        (
          <div className="mx-auto max-w-[1160px] px-6 py-14 md:px-10">

          
          <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          {/* Logo + tagline */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2">
              <span className="block h-[9px] w-[9px] -translate-y-[1px] rounded-[2px] bg-[var(--amber)]" />
              <span
                className="text-[19px] font-semibold tracking-tight text-[var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Flowboard
              </span>
            </Link>
            <p className="mt-3 text-sm text-[var(--ink-soft)]">
              Capture ideas in your inbox, then drag them onto a board when
              they&apos;re ready to move.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-16">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <p className="text-[13px] font-medium text-[var(--ink)]">
                  {heading}
                </p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        </div>
        ) }

        {/* Bottom bar */}
       
     <div
  className={`mt-12 flex gap-4 border-t border-[var(--mist)] pt-6
    ${
      isAuthPage
        ? "flex items-center justify-center"
        : "flex sm:flex-row sm:items-center sm:justify-between"
    }
  `}
>
  <p className="text-[13px] text-[var(--ink-soft)]">
    © {year} Flowboard.
  </p>

  <div className="flex gap-5">
    <Link
      href="/privacy"
      className="text-[13px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
    >
      Privacy
    </Link>

    <Link
      href="/terms"
      className="text-[13px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
    >
      Terms
    </Link>
  </div>
</div>
      </div>
    </footer>
  );
}
