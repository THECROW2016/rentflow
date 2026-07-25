"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasRole } from "@/lib/auth";
import { z } from "zod";
const paymentSchema = z.object({
  leaseId: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  type: z
    .enum(["RENT", "DEPOSIT", "LATE_FEE", "UTILITY", "OTHER"])
    .default("RENT"),
  dueDate: z.string().min(1),
  status: z
    .enum(["PENDING", "PAID", "PARTIAL", "OVERDUE", "CANCELLED"])
    .default("PENDING"),
  method: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export async function createPayment(formData: FormData) {
  const session = await requireAuth();
  if (!session) return { error: "Unauthorized" };
  if (!hasRole(session, ["OWNER", "ADMIN", "MANAGER", "STAFF"])) {
    return { error: "Permission denied" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid data" };
  }

  const lease = await prisma.lease.findFirst({
    where: { id: parsed.data.leaseId, organizationId: session.organizationId },
  });
  if (!lease) return { error: "Lease not found" };

  try {
    const paidAt =
      parsed.data.status === "PAID" ? new Date() : undefined;

    await prisma.payment.create({
      data: {
        organizationId: session.organizationId,
        leaseId: parsed.data.leaseId,
        amount: parsed.data.amount,
        type: parsed.data.type,
        status: parsed.data.status,
        dueDate: new Date(parsed.data.dueDate),
        paidAt,
        method: parsed.data.method || null,
        reference: parsed.data.reference || null,
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath("/dashboard/payments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create payment" };
  }
}

export async function markPaymentPaid(
  paymentId: string,
  method?: string,
  reference?: string
) {
  const session = await requireAuth();
  if (!session) return { error: "Unauthorized" };
  if (!hasRole(session, ["OWNER", "ADMIN", "MANAGER", "STAFF"])) {
    return { error: "Permission denied" };
  }

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, organizationId: session.organizationId },
  });
  if (!payment) return { error: "Payment not found" };

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      method: method || payment.method,
      reference: reference || payment.reference,
    },
  });

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markPaymentOverdue(paymentId: string) {
  const session = await requireAuth();
  if (!session) return { error: "Unauthorized" };
  if (!hasRole(session, ["OWNER", "ADMIN", "MANAGER"])) {
    return { error: "Permission denied" };
  }

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, organizationId: session.organizationId },
  });
  if (!payment) return { error: "Payment not found" };

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "OVERDUE" },
  });

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard");
  return { success: true };
}
