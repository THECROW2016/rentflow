"use client";

import { useState } from "react";
import { createPayment } from "@/app/actions/payments";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type Option = { value: string; label: string };

type Props = {
  open: boolean;
  onClose: () => void;
  leases: Option[];
};

export function PaymentForm({ open, onClose, leases }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createPayment(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Record Payment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}
        <Select name="leaseId" label="Lease / Tenant" required options={leases} placeholder="Select lease..." />
        <div className="grid grid-cols-2 gap-3">
          <Input name="amount" label="Amount" type="number" required min="1" step="0.01" />
          <Input name="dueDate" label="Due date" type="date" required />
        </div>
        <Select name="type" label="Type" options={[{ value: "RENT", label: "Rent" }, { value: "DEPOSIT", label: "Deposit" }, { value: "LATE_FEE", label: "Late fee" }, { value: "UTILITY", label: "Utility" }, { value: "OTHER", label: "Other" }]} defaultValue="RENT" />
        <Select name="status" label="Status" options={[{ value: "PENDING", label: "Pending" }, { value: "PAID", label: "Paid" }, { value: "PARTIAL", label: "Partial" }]} defaultValue="PENDING" />
        <div className="grid grid-cols-2 gap-3">
          <Input name="method" label="Payment method" placeholder="M-Pesa / Bank / Cash" />
          <Input name="reference" label="Reference" placeholder="Transaction ID" />
        </div>
        <Textarea name="notes" label="Notes" />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Payment</Button>
        </div>
      </form>
    </Modal>
  );
}
