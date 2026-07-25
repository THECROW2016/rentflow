"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasRole } from "@/lib/auth";
import { z } from "zod";

const leaseSchema = z.object({
  unitId: z.string().min(1),
  tenantId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  rentAmount: z.coerce.number().min(0),
  depositAmount: z.coerce.number().min(0).default(0),
  paymentDueDay: z.coerce.number().min(1).max(28).default(1),
  status: z
    .enum(["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED", "PENDING"])
    .default("ACTIVE"),
  terms: z.string().optional(),
});

export async function createLease(formData: FormData) {
  const session = await requireAuth();
  if (!session) return { error: "Unauthorized" };
  if (!hasRole(session, ["OWNER", "ADMIN", "MANAGER"])) {
    return { error: "Permission denied" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = leaseSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid data" };
  }

  const [unit, tenant] = await Promise.all([
    prisma.unit.findFirst({
      where: {
        id: parsed.data.unitId,
        property: { organizationId: session.organizationId },
      },
    }),
    prisma.tenant.findFirst({
      where: {
        id: parsed.data.tenantId,
        organizationId: session.organizationId,
      },
    }),
  ]);

  if (!unit) return { error: "Unit not found" };
  if (!tenant) return { error: "Tenant not found" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.lease.create({
        data: {
          organizationId: session.organizationId,
          unitId: parsed.data.unitId,
          tenantId: parsed.data.tenantId,
          createdById: session.id,
          startDate: new Date(parsed.data.startDate),
          endDate: new Date(parsed.data.endDate),
          rentAmount: parsed.data.rentAmount,
          depositAmount: parsed.data.depositAmount,
          paymentDueDay: parsed.data.paymentDueDay,
          status: parsed.data.status,
          terms: parsed.data.terms,
        },
      });

      if (parsed.data.status === "ACTIVE") {
        await tx.unit.update({
          where: { id: parsed.data.unitId },
          data: { status: "OCCUPIED" },
        });
      }
    });

    revalidatePath("/dashboard/leases");
    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create lease" };
  }
}
