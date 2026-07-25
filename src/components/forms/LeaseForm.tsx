"use client";

import { useState } from "react";
import { createLease } from "@/app/actions/leases";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type Option = { value: string; label: string };

type Props = {
  open: boolean;
  onClose: () => void;
  units: Option[];
  tenants: Option[];
};

export function LeaseForm({ open, onClose, units, tenants }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createLease(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Lease" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <Select name="unitId" label="Unit" required options={units} placeholder="Select unit..." />
        <Select name="tenantId" label="Tenant" required options={tenants} placeholder="Select tenant..." />
        <div className="grid grid-cols-2 gap-3">
          <Input name="startDate" label="Start date" type="date" required />
          <Input name="endDate" label="End date" type="date" required />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input name="rentAmount" label="Monthly rent" type="number" required />
          <Input name="depositAmount" label="Deposit" type="number" defaultValue="0" />
          <Input name="paymentDueDay" label="Due day of month" type="number" defaultValue="1" min="1" max="28" />
        </div>
        <Select name="status" label="Status" options={[{ value: "ACTIVE", label: "Active" }, { value: "DRAFT", label: "Draft" }, { value: "PENDING", label: "Pending" }]} defaultValue="ACTIVE" />
        <Textarea name="terms" label="Additional terms" placeholder="Optional..." />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Lease</Button>
        </div>
      </form>
    </Modal>
  );
}
