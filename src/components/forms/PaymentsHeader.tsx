"use client";

import { useState } from "react";
import { PaymentForm } from "./PaymentForm";
import { Button } from "@/components/ui/Button";

type Option = { value: string; label: string };

type Props = {
  leases: Option[];
};

export function PaymentsHeader({ leases }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 mt-1">Track rent and other payments</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Record Payment</Button>
      </div>
      <PaymentForm open={open} onClose={() => setOpen(false)} leases={leases} />
    </>
  );
}
