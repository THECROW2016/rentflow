"use client";

import { useState } from "react";
import { MaintenanceForm } from "./MaintenanceForm";
import { Button } from "@/components/ui/Button";

type Option = { value: string; label: string };

type Props = {
  leases: Option[];
};

export function MaintenanceHeader({ leases }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
          <p className="text-slate-500 mt-1">Track and resolve repair requests</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ New Ticket</Button>
      </div>
      <MaintenanceForm open={open} onClose={() => setOpen(false)} leases={leases} />
    </>
  );
}
