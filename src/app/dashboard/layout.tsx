import DashboardSidebar from "@/components/DashboardSideBar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-[var(--paper)]">
      <DashboardSidebar />

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}