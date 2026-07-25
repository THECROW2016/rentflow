"use client";

import { useState } from "react";
import { PropertyForm } from "./PropertyForm";
import { UnitForm } from "./UnitForm";
import { Button } from "@/components/ui/Button";

type PropertyOption = { id: string; name: string };

type Props = {
  properties: PropertyOption[];
};

export function PropertiesHeader({ properties }: Props) {
  const [showProperty, setShowProperty] = useState(false);
  const [showUnit, setShowUnit] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyOption | null>(null);

  function openUnitForm(prop: PropertyOption) {
    setSelectedProperty(prop);
    setShowUnit(true);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-slate-500 mt-1">Manage your buildings and individual units</p>
        </div>
        <div className="flex gap-2">
          {properties.length > 0 && (
            <Button variant="secondary" onClick={() => openUnitForm(properties[0])}>
              + Add Unit
            </Button>
          )}
          <Button onClick={() => setShowProperty(true)}>+ Add Property</Button>
        </div>
      </div>
      <PropertyForm open={showProperty} onClose={() => setShowProperty(false)} />
      {selectedProperty && (
        <UnitForm
          open={showUnit}
          onClose={() => { setShowUnit(false); setSelectedProperty(null); }}
          propertyId={selectedProperty.id}
          propertyName={selectedProperty.name}
        />
      )}
    </>
  );
}

export function AddUnitButton({ propertyId, propertyName }: { propertyId: string; propertyName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-sm text-blue-600 font-medium hover:underline">
        + Unit
      </button>
      <UnitForm open={open} onClose={() => setOpen(false)} propertyId={propertyId} propertyName={propertyName} />
    </>
  );
}
