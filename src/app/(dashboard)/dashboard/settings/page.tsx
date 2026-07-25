import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    include: { members: { include: { user: true } } },
  });

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Organization and team management</p>
      </div>
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Organization</h2>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900 mt-0.5">{org?.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Slug</dt>
            <dd className="font-medium text-slate-900 mt-0.5">{org?.slug}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900 mt-0.5">{org?.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd className="font-medium text-slate-900 mt-0.5">{org?.phone || "—"}</dd>
          </div>
        </dl>
      </section>
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Team members</h2>
          <button className="text-sm text-blue-600 font-medium hover:underline">+ Invite</button>
        </div>
        <div className="divide-y divide-slate-100">
          {org?.members.map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                  {m.user.firstName[0]}{m.user.lastName[0]}
                </div>
                <div>
                  <div className="font-medium text-sm text-slate-900">{m.user.firstName} {m.user.lastName}</div>
                  <div className="text-xs text-slate-500">{m.user.email}</div>
                </div>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{m.role}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-2">Your account</h2>
        <p className="text-sm text-slate-600">Signed in as {session.firstName} {session.lastName} ({session.email})</p>
        <p className="text-sm text-slate-500 mt-1">Role: {session.role}</p>
      </section>
    </div>
  );
}
