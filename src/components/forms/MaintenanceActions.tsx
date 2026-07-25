"use client";

import { useState } from "react";
import { updateMaintenanceStatus } from "@/app/actions/maintenance";
import { Button } from "@/components/ui/Button";

type Props = {
  ticketId: string;
  currentStatus: string;
};

export function MaintenanceActions({ ticketId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);

  async function setStatus(status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
    setLoading(true);
    await updateMaintenanceStatus(ticketId, status);
    setLoading(false);
  }

  if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currentStatus === "OPEN" && (
        <Button size="sm" variant="secondary" loading={loading} onClick={() => setStatus("IN_PROGRESS")}>
          Start work
        </Button>
      )}
      {(currentStatus === "OPEN" || currentStatus === "IN_PROGRESS" || currentStatus === "WAITING_PARTS") && (
        <Button size="sm" loading={loading} onClick={() => setStatus("COMPLETED")}>
          Complete
        </Button>
      )}
      <Button size="sm" variant="ghost" loading={loading} onClick={() => setStatus("CANCELLED")}>
        Cancel
      </Button>
    </div>
  );
}
