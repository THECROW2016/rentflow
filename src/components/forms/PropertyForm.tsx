"use client";

import { useState } from "react";
import { createProperty } from "@/app/actions/properties";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const propertyTypes = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "CONDO", label: "Condo" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "OTHER", label: "Other" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PropertyForm({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createProperty(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Property" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <Input name="name" label="Property name" required placeholder="Kilimani Heights" />
        <Input name="address" label="Address" required placeholder="Argwings Kodhek Road" />
        <div className="grid grid-cols-2 gap-3">
          <Input name="city" label="City" required placeholder="Nairobi" />
          <Input name="state" label="State / County" placeholder="Nairobi" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input name="zipCode" label="Postal code" placeholder="00100" />
          <Input name="country" label="Country" defaultValue="KE" />
        </div>
        <Select name="type" label="Type" options={propertyTypes} defaultValue="APARTMENT" />
        <Input name="yearBuilt" label="Year built" type="number" placeholder="2019" />
        <Textarea name="description" label="Description" placeholder="Optional notes..." />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Property
          </Button>
        </div>
      </form>
    </Modal>
  );
}
