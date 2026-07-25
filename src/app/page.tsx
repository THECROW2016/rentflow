import Link from "next/link";
import { Building2, Users, CreditCard, Wrench, Shield, BarChart3, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">RentFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2">Sign in</Link>
            <Link href="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Start free</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
          <Shield className="w-4 h-4" /> Multi-tenant · Secure · Built for scale
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          The modern way to manage <span className="text-blue-600">rental properties</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          RentFlow is a powerful multi-tenant platform for landlords and property managers.
          Track properties, tenants, leases, rent payments and maintenance — all in one place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 transition">
            View demo
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">Demo: owner@amaniproperties.co.ke / password123</p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">Everything you need to run your rental business</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Building2, title: "Properties & Units", desc: "Organize houses, apartments and commercial units with status and occupancy tracking." },
            { icon: Users, title: "Tenant Management", desc: "Store tenant profiles, emergency contacts and complete lease history." },
            { icon: CreditCard, title: "Rent & Payments", desc: "Track due dates, mark payments, and see overdue rents at a glance." },
            { icon: Wrench, title: "Maintenance Tickets", desc: "Report issues, assign, prioritize and close tickets with full audit trail." },
            { icon: Shield, title: "True Multi-Tenancy", desc: "Each landlord or agency gets fully isolated data with role-based access." },
            { icon: BarChart3, title: "Dashboard & Insights", desc: "Occupancy rate, expected vs collected rent, and open tickets in real time." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>RentFlow © 2026</span>
          </div>
          <p>Multi-tenant rental management system</p>
        </div>
      </footer>
    </div>
  );
}
