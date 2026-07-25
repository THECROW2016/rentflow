import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { TenantsHeader } from "@/components/forms/TenantsHeader";

export default async function TenantsPage() {
  const session = await getSession();
  if (!session) return null;

  const tenants = await prisma.tenant.findMany({
    where: { organizationId: session.organizationId },
    include: {
      leases: {
        where: { status: "ACTIVE" },
        include: { unit: { include: { property: true } } },
        take: 1,
      },
    },
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="space-y-6">
      <TenantsHeader />
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Contact</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Current Unit</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map((t) => {
              const lease = t.leases[0];
              return (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900">{t.firstName} {t.lastName}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <div>{t.email}</div>
                    <div className="text-xs text-slate-400">{t.phone}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {lease ? `${lease.unit.property.name} · ${lease.unit.unitNumber}` : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    {lease ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">Active</span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">No lease</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                  <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  No tenants yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
