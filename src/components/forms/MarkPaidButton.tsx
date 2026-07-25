"use client";

import { useState } from "react";
import { markPaymentPaid } from "@/app/actions/payments";
import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

type Props = {
  paymentId: string;
};

export function MarkPaidButton({ paymentId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await markPaymentPaid(paymentId);
    setLoading(false);
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      loading={loading}
      onClick={handleClick}
      className="text-green-700 border-green-200 hover:bg-green-50"
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      Mark paid
    </Button>
  );
}
