"use client";

import { useState } from "react";
import { LeaseForm } from "./LeaseForm";
import { Button } from "@/components/ui/Button";

type Option = { value: string; label: string };

type Props = {
  units: Option[];
  tenants: Option[];
};

export function LeasesHeader({ units, tenants }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leases</h1>
          <p className="text-slate-500 mt-1">Active and past rental agreements</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ New Lease</Button>
      </div>
      <LeaseForm open={open} onClose={() => setOpen(false)} units={units} tenants={tenants} />
    </>
  );
}
