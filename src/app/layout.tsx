import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";

// Fonts named by the design tokens in globals.css (--font-body, --font-display).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowBoard",
  description: "Task Manager App",
  icons: {
    icon: "/favicon.svg",
  },
};

// Apply the saved theme before first paint so dark mode does not flash light.
// Mirrors getInitialTheme() in Header and DashboardSideBar.
const themeScript = `(function(){try{var t=localStorage.getItem("flowboard-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      // data-theme is set by themeScript before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="flex min-h-screen flex-col">
          {/* Wrap children so all pages have access to React Query hooks */}
          <ToastProvider>
            <QueryProvider>{children}</QueryProvider>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
