import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Home, MapPin, Bed, Bath } from "lucide-react";
import { PropertiesHeader, AddUnitButton } from "@/components/forms/PropertiesHeader";

export default async function PropertiesPage() {
  const session = await getSession();
  if (!session) return null;

  const properties = await prisma.property.findMany({
    where: { organizationId: session.organizationId },
    include: {
      units: {
        select: {
          id: true,
          unitNumber: true,
          bedrooms: true,
          bathrooms: true,
          rentAmount: true,
          status: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PropertiesHeader properties={properties.map((p) => ({ id: p.id, name: p.name }))} />
      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900">No properties yet</h3>
          <p className="text-slate-500 text-sm mt-1">Add your first property to start managing units and leases.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {properties.map((prop) => {
            const occupied = prop.units.filter((u) => u.status === "OCCUPIED").length;
            const totalRent = prop.units.filter((u) => u.status === "OCCUPIED").reduce((s, u) => s + Number(u.rentAmount), 0);
            return (
              <div key={prop.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-lg text-slate-900">{prop.name}</h2>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {prop.address}, {prop.city}{prop.state ? `, ${prop.state}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{occupied}/{prop.units.length} units</div>
                      <div className="text-slate-500">{formatCurrency(totalRent, "KES")}/mo</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium capitalize">{prop.type.toLowerCase()}</span>
                    <AddUnitButton propertyId={prop.id} propertyName={prop.name} />
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {prop.units.length === 0 ? (
                    <div className="px-6 py-4 text-sm text-slate-500">No units yet — click "+ Unit" to add one.</div>
                  ) : (
                    prop.units.map((unit) => (
                      <div key={unit.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-semibold text-sm text-slate-700">{unit.unitNumber}</div>
                          <div>
                            <div className="font-medium text-sm text-slate-900">Unit {unit.unitNumber}</div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                              <span className="inline-flex items-center gap-1"><Bed className="w-3 h-3" /> {unit.bedrooms} bed</span>
                              <span className="inline-flex items-center gap-1"><Bath className="w-3 h-3" /> {unit.bathrooms} bath</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold text-sm">{formatCurrency(Number(unit.rentAmount), "KES")}</div>
                            <div className="text-xs text-slate-500">/ month</div>
                          </div>
                          <StatusBadge status={unit.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    VACANT: "bg-emerald-50 text-emerald-700",
    OCCUPIED: "bg-blue-50 text-blue-700",
    MAINTENANCE: "bg-amber-50 text-amber-700",
    RESERVED: "bg-purple-50 text-purple-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
