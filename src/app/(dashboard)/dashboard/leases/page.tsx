import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";
import { LeasesHeader } from "@/components/forms/LeasesHeader";

export default async function LeasesPage() {
  const session = await getSession();
  if (!session) return null;

  const [leases, units, tenants] = await Promise.all([
    prisma.lease.findMany({
      where: { organizationId: session.organizationId },
      include: { tenant: true, unit: { include: { property: true } } },
      orderBy: { startDate: "desc" },
    }),
    prisma.unit.findMany({
      where: { property: { organizationId: session.organizationId } },
      include: { property: true },
      orderBy: [{ property: { name: "asc" } }, { unitNumber: "asc" }],
    }),
    prisma.tenant.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { lastName: "asc" },
    }),
  ]);

  const unitOptions = units.map((u) => ({
    value: u.id,
    label: `${u.property.name} · ${u.unitNumber} (${u.status})`,
  }));
  const tenantOptions = tenants.map((t) => ({
    value: t.id,
    label: `${t.firstName} ${t.lastName}`,
  }));

  return (
    <div className="space-y-6">
      <LeasesHeader units={unitOptions} tenants={tenantOptions} />
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Tenant</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Unit</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Period</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Rent</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leases.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5 font-medium text-slate-900">{l.tenant.firstName} {l.tenant.lastName}</td>
                <td className="px-5 py-3.5 text-slate-600">{l.unit.property.name} · {l.unit.unitNumber}</td>
                <td className="px-5 py-3.5 text-slate-600">{formatDate(l.startDate)} → {formatDate(l.endDate)}</td>
                <td className="px-5 py-3.5 font-medium">{formatCurrency(Number(l.rentAmount), "KES")}</td>
                <td className="px-5 py-3.5"><StatusBadge status={l.status} /></td>
              </tr>
            ))}
            {leases.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  No leases yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700",
    DRAFT: "bg-slate-100 text-slate-600",
    EXPIRED: "bg-amber-50 text-amber-700",
    TERMINATED: "bg-red-50 text-red-700",
    PENDING: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || styles.DRAFT}`}>
      {status}
    </span>
  );
}
