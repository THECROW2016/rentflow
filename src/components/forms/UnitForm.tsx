"use client";

import { useState } from "react";
import { createUnit } from "@/app/actions/properties";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const statuses = [
  { value: "VACANT", label: "Vacant" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "RESERVED", label: "Reserved" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
};

export function UnitForm({ open, onClose, propertyId, propertyName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("propertyId", propertyId);
    const result = await createUnit(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Add Unit — ${propertyName}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <Input name="unitNumber" label="Unit number" required placeholder="A1 / House 1" />
        <div className="grid grid-cols-3 gap-3">
          <Input name="bedrooms" label="Bedrooms" type="number" defaultValue="1" min="0" />
          <Input name="bathrooms" label="Bathrooms" type="number" step="0.5" defaultValue="1" min="0" />
          <Input name="sqft" label="Sq ft" type="number" placeholder="950" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input name="rentAmount" label="Monthly rent" type="number" required placeholder="65000" />
          <Input name="deposit" label="Deposit" type="number" defaultValue="0" />
        </div>
        <Select name="status" label="Status" options={statuses} defaultValue="VACANT" />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Unit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
