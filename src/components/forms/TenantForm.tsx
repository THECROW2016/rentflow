"use client";

import { useState, type FormEvent } from "react";
import { createTenant } from "@/app/actions/tenants";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function TenantForm({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createTenant(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Tenant" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <Input name="firstName" label="First name" required />
          <Input name="lastName" label="Last name" required />
        </div>
        <Input name="email" label="Email" type="email" required />
        <Input name="phone" label="Phone" placeholder="+2547..." />
        <div className="grid grid-cols-2 gap-3">
          <Input name="emergencyContact" label="Emergency contact" />
          <Input name="emergencyPhone" label="Emergency phone" />
        </div>
        <Input name="idNumber" label="ID / Passport number" />
        <Textarea name="notes" label="Notes" placeholder="Optional..." />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Add Tenant</Button>
        </div>
      </form>
    </Modal>
  );
}
