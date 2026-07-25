"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    organizationName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">RentFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create your organization</h1>
          <p className="text-slate-500 mt-1">Start managing properties in minutes</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization name</label>
            <input type="text" value={form.organizationName} onChange={(e) => update("organizationName", e.target.value)} required className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Amani Properties Ltd" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
              <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
              <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Work email</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min. 8 characters" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create organization
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
