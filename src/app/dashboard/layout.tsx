
import DashboardSidebar from "@/components/DashboardSideBar";

export default function DashboardLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-[var(--paper-raised)]">
      <DashboardSidebar />

      <main className="min-w-0 flex-1">
        {children}
        {modal}
      </main>
    </div>
  );
}