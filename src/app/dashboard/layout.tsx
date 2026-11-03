import DashboardSidebar from "@/components/dashboard/DashboardSideBar";

export default function DashboardLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-app-bg)] lg:flex-row">
      <DashboardSidebar />

      <main className="min-w-0 flex-1">
        {children}
        {modal}
      </main>
    </div>
  );
}
