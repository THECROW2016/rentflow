import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        organizationName={session.organizationName}
        userName={`${session.firstName} ${session.lastName}`}
        role={session.role}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
