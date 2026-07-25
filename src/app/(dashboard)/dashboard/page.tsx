import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils";
import { Home, Users, CreditCard, Wrench, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { ElementType } from "react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const orgId = session.organizationId;

  const [propertiesCount, units, tenantsCount, activeLeases, payments, openMaintenance] =
    await Promise.all([
      prisma.property.count({ where: { organizationId: orgId } }),
      prisma.unit.findMany({
        where: { property: { organizationId: orgId } },
        select: { status: true, rentAmount: true },
      }),
      prisma.tenant.count({ where: { organizationId: orgId } }),
      prisma.lease.count({ where: { organizationId: orgId, status: "ACTIVE" } }),
      prisma.payment.findMany({
        where: { organizationId: orgId },
        include: {
          lease: {
            include: {
              tenant: true,
              unit: { include: { property: true } },
            },
          },
        },
        orderBy: { dueDate: "desc" },
        take: 8,
      }),
      prisma.maintenanceRequest.findMany({
        where: { organizationId: orgId, status: { in: ["OPEN", "IN_PROGRESS"] } },
        orderBy: { reportedAt: "desc" },
        take: 5,
      }),
    ]);

  const occupied = units.filter((u) => u.status === "OCCUPIED").length;
  const totalUnits = units.length;
  const occupancy = totalUnits ? Math.round((occupied / totalUnits) * 100) : 0;
  const expectedRent = units
    .filter((u) => u.status === "OCCUPIED")
    .reduce((sum, u) => sum + Number(u.rentAmount), 0);
  const overdueCount = payments.filter(
    (p) => p.status === "OVERDUE" || (p.status === "PENDING" && isOverdue(p.dueDate))
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {session.firstName}</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with {session.organizationName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Properties" value={String(propertiesCount)} sub={`${totalUnits} units · ${occupancy}% occupied`} icon={Home} color="blue" />
        <KpiCard title="Active Leases" value={String(activeLeases)} sub={`${tenantsCount} tenants`} icon={Users} color="indigo" />
        <KpiCard title="Expected Rent" value={formatCurrency(expectedRent, "KES")} sub={`${overdueCount} overdue`} icon={CreditCard} color="emerald" />
        <KpiCard title="Open Tickets" value={String(openMaintenance.length)} sub="Maintenance" icon={Wrench} color="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Payments</h2>
            <Link href="/dashboard/payments" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {payments.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No payments yet</p>
            ) : (
              payments.map((p) => {
                const overdue = p.status === "OVERDUE" || (p.status === "PENDING" && isOverdue(p.dueDate));
                return (
                  <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-slate-900 truncate">{p.lease.tenant.firstName} {p.lease.tenant.lastName}</div>
                      <div className="text-xs text-slate-500">{p.lease.unit.property.name} · Unit {p.lease.unit.unitNumber}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-sm">{formatCurrency(Number(p.amount), "KES")}</div>
                      <div className={`text-xs font-medium ${p.status === "PAID" ? "text-green-600" : overdue ? "text-red-600" : "text-amber-600"}`}>
                        {p.status === "PAID" ? (
                          <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Paid</span>
                        ) : overdue ? (
                          <span className="inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Overdue</span>
                        ) : (
                          `Due ${formatDate(p.dueDate)}`
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Open Maintenance</h2>
            <Link href="/dashboard/maintenance" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {openMaintenance.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No open tickets</p>
            ) : (
              openMaintenance.map((m) => (
                <div key={m.id} className="px-5 py-3.5">
                  <div className="font-medium text-sm text-slate-900">{m.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.description}</div>
                  <div className="mt-1.5 text-xs text-slate-400">{m.status.replace("_", " ")} · {formatDate(m.reportedAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  icon: ElementType;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-400 mt-1">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
