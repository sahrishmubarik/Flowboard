

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from  "@/components/Footer";
import QueryProvider from "@/components/QueryProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowBoard",
  description: "Task Manager App",
   icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
     
      
       <body className="min-h-full flex flex-col">
        <div className="flex min-h-screen flex-col">
       <Header />
      {/* Wrap children so all pages have access to React Query hooks */}
       <ToastProvider> 
        <QueryProvider>
          {children} 
          </QueryProvider>
           </ToastProvider>
       <Footer />
       </div>
       </body>
    </html>
  );
}
