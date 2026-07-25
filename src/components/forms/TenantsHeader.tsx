"use client";

import { useState } from "react";
import { TenantForm } from "./TenantForm";
import { Button } from "@/components/ui/Button";

export function TenantsHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
          <p className="text-slate-500 mt-1">All renters across your properties</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Add Tenant</Button>
      </div>
      <TenantForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}
