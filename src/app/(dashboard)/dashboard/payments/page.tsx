import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import { PaymentsHeader } from "@/components/forms/PaymentsHeader";
import { MarkPaidButton } from "@/components/forms/MarkPaidButton";

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session) return null;

  const [payments, leases] = await Promise.all([
    prisma.payment.findMany({
      where: { organizationId: session.organizationId },
      include: {
        lease: {
          include: {
            tenant: true,
            unit: { include: { property: true } },
          },
        },
      },
      orderBy: { dueDate: "desc" },
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
      <PaymentsHeader leases={leaseOptions} />
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Tenant</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Unit</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Type</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Due</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Amount</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-5 py-3 font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => {
              const overdue =
                p.status === "OVERDUE" ||
                (p.status === "PENDING" && isOverdue(p.dueDate));
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {p.lease.tenant.firstName} {p.lease.tenant.lastName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {p.lease.unit.property.name} · {p.lease.unit.unitNumber}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{p.type}</td>
                  <td className="px-5 py-3.5 text-slate-600">{formatDate(p.dueDate)}</td>
                  <td className="px-5 py-3.5 font-medium">{formatCurrency(Number(p.amount), "KES")}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        p.status === "PAID"
                          ? "bg-green-50 text-green-700"
                          : overdue
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {overdue && p.status !== "PAID" ? "OVERDUE" : p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {p.status !== "PAID" && <MarkPaidButton paymentId={p.id} />}
                  </td>
                </tr>
              );
            })}
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                  <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  No payments recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
