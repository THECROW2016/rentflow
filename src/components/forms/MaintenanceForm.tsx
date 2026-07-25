"use client";

import { useState } from "react";
import { createMaintenanceTicket } from "@/app/actions/maintenance";
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

export function MaintenanceForm({ open, onClose, leases }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createMaintenanceTicket(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Maintenance Ticket" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}
        <Input name="title" label="Title" required placeholder="Leaking kitchen sink" />
        <Textarea name="description" label="Description" required placeholder="Describe the issue..." />
        <div className="grid grid-cols-2 gap-3">
          <Select name="priority" label="Priority" options={[{ value: "LOW", label: "Low" }, { value: "MEDIUM", label: "Medium" }, { value: "HIGH", label: "High" }, { value: "URGENT", label: "Urgent" }]} defaultValue="MEDIUM" />
          <Input name="category" label="Category" placeholder="Plumbing, Electrical..." />
        </div>
        <Select name="leaseId" label="Related lease (optional)" options={leases} placeholder="None" />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Ticket</Button>
        </div>
      </form>
    </Modal>
  );
}
