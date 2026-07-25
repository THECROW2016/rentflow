import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Wrench } from "lucide-react";
import { MaintenanceHeader } from "@/components/forms/MaintenanceHeader";
import { MaintenanceActions } from "@/components/forms/MaintenanceActions";

export default async function MaintenancePage() {
  const session = await getSession();
  if (!session) return null;

  const [tickets, leases] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where: { organizationId: session.organizationId },
      include: {
        lease: {
          include: {
            tenant: true,
            unit: { include: { property: true } },
          },
        },
        assignedTo: true,
      },
      orderBy: { reportedAt: "desc" },
    }),
    prisma.lease.findMany({
      where: { organizationId: session.organizationId, status: "ACTIVE" },
      include: {
        tenant: true,
        unit: { include: { property: true } },
      },
    }),
  ]);

  const leaseOptions = leases.map((l) => ({
    value: l.id,
    label: `${l.tenant.firstName} ${l.tenant.lastName} — ${l.unit.property.name} ${l.unit.unitNumber}`,
  }));

  return (
    <div className="space-y-6">
      <MaintenanceHeader leases={leaseOptions} />
      <div className="space-y-3">
        {tickets.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900">{t.title}</h3>
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </div>
              <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{t.description}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                {t.lease && (
                  <span>{t.lease.unit.property.name} · {t.lease.unit.unitNumber} · {t.lease.tenant.firstName} {t.lease.tenant.lastName}</span>
                )}
                <span>Reported {formatDate(t.reportedAt)}</span>
                {t.category && <span>{t.category}</span>}
                {t.assignedTo && <span>Assigned to {t.assignedTo.firstName} {t.assignedTo.lastName}</span>}
              </div>
            </div>
            <MaintenanceActions ticketId={t.id} currentStatus={t.status} />
          </div>
        ))}
        {tickets.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900">No tickets</h3>
            <p className="text-slate-500 text-sm mt-1">All clear — no open maintenance requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-blue-50 text-blue-700",
    HIGH: "bg-amber-50 text-amber-700",
    URGENT: "bg-red-50 text-red-700",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${styles[priority] || styles.MEDIUM}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-red-50 text-red-700",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    WAITING_PARTS: "bg-amber-50 text-amber-700",
    COMPLETED: "bg-green-50 text-green-700",
    CANCELLED: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${styles[status] || styles.OPEN}`}>
      {status.replace("_", " ")}
    </span>
  );
}
