// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Menu, Moon, Sun, X } from "lucide-react";

// const navLinks = [
//   { label: "Product", href: "#board" },
//   { label: "Pricing", href: "#pricing" },
//   { label: "Docs", href: "#docs" },
// ];

// type Theme = "light" | "dark";

// export default function Header() {
//   const [open, setOpen] = useState(false);
//   const [theme, setTheme] = useState<Theme>("light");
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     const savedTheme = localStorage.getItem("flowboard-theme") as Theme | null;
//     const systemTheme: Theme = window.matchMedia("(prefers-color-scheme: dark)")
//       .matches
//       ? "dark"
//       : "light";

//     const nextTheme = savedTheme ?? systemTheme;

//     document.documentElement.setAttribute("data-theme", nextTheme);
//     setTheme(nextTheme);
//     setMounted(true);
//   }, []);

//   function toggleTheme() {
//     const nextTheme: Theme = theme === "dark" ? "light" : "dark";

//     document.documentElement.setAttribute("data-theme", nextTheme);
//     localStorage.setItem("flowboard-theme", nextTheme);
//     setTheme(nextTheme);
//   }

//   return (
//     <header className="site-header ">
//       <div className="site-header-inner">
//         <Link href="/" className="brand">
//           <span className="brand-mark">F</span>
//           <span className="brand-name">Flowboard</span>
//         </Link>

//         <nav className="font-serif hidden items-center gap-7 md:flex">
//           {navLinks.map((link) => (
//             <Link key={link.href} href={link.href} className="header-link">
//               {link.label}
//             </Link>
//           ))}

//           <button
//             type="button"
//             onClick={toggleTheme}
//             className="theme-toggle "
//             aria-label={
//               theme === "dark"
//                 ? "Switch to light theme"
//                 : "Switch to dark theme"
//             }
//             title={theme === "dark" ? "Light theme" : "Dark theme"}
//           >
//             {mounted && theme === "dark" ? (
//               <Sun size={17} className="cursor-pointer " />
//             ) : (
//               <Moon size={17} className="cursor-pointer " />
//             )}
//           </button>

//           <Link href="/auth/login" className="header-link">
//             Sign in
//           </Link>

//           <Link href="/auth/register" className="header-cta">
//             Start free
//           </Link>
//         </nav>

//         <div className="flex items-center gap-2 md:hidden">
//           <button
//             type="button"
//             onClick={toggleTheme}
//             className="theme-toggle"
//             aria-label={
//               theme === "dark"
//                 ? "Switch to light theme"
//                 : "Switch to dark theme"
//             }
//           >
//             {mounted && theme === "dark" ? (
//               <Sun size={17} />
//             ) : (
//               <Moon size={17} />
//             )}
//           </button>

//           <button
//             type="button"
//             aria-label={open ? "Close menu" : "Open menu"}
//             aria-expanded={open}
//             onClick={() => setOpen((prev) => !prev)}
//             className="theme-toggle"
//           >
//             {open ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>
//       </div>

//       {open && (
//         <nav className="border-t border-[var(--color-border)] bg-[var(--color-app-bg)] px-6 py-4 md:hidden">
//           <div className="mx-auto flex max-w-[1160px] flex-col gap-1">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 onClick={() => setOpen(false)}
//                 className="mobile-header-link"
//               >
//                 {link.label}
//               </Link>
//             ))}

//             <Link
//               href="/auth/login"
//               onClick={() => setOpen(false)}
//               className="mobile-header-link"
//             >
//               Sign in
//             </Link>

//             <Link
//               href="/auth/register"
//               onClick={() => setOpen(false)}
//               className="header-cta mt-2 text-center"
//             >
//               Start free
//             </Link>
//           </div>
//         </nav>
//       )}
//     </header>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";

const navLinks = [
  { label: "Product", href: "#board" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = localStorage.getItem("flowboard-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function Header() {
  const [open, setOpen] = useState(false);

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    localStorage.setItem("flowboard-theme", nextTheme);
    setTheme(nextTheme);
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">F</span>
          <span className="brand-name">Flowboard</span>
        </Link>

        <nav className="font-serif hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="header-link">
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            title={theme === "dark" ? "Light theme" : "Dark theme"}
          >
            {theme === "dark" ? (
              <Sun size={17} className="cursor-pointer" />
            ) : (
              <Moon size={17} className="cursor-pointer" />
            )}
          </button>

          <Link href="/auth/login" className="header-link">
            Sign in
          </Link>

          <Link href="/auth/register" className="header-cta">
            Start free
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="theme-toggle"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[var(--color-border)] bg-[var(--color-app-bg)] px-6 py-4 md:hidden">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="mobile-header-link"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="mobile-header-link"
            >
              Sign in
            </Link>

            <Link
              href="/auth/register"
              onClick={() => setOpen(false)}
              className="header-cta mt-2 text-center"
            >
              Start free
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
