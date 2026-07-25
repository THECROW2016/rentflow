"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasRole } from "@/lib/auth";
import { z } from "zod";

const tenantSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  idNumber: z.string().optional(),
  notes: z.string().optional(),
});

export async function createTenant(formData: FormData) {
  const session = await requireAuth();
  if (!session) return { error: "Unauthorized" };
  if (!hasRole(session, ["OWNER", "ADMIN", "MANAGER"])) {
    return { error: "Permission denied" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = tenantSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid data" };
  }

  try {
    await prisma.tenant.create({
      data: {
        ...parsed.data,
        organizationId: session.organizationId,
      },
    });
    revalidatePath("/dashboard/tenants");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create tenant" };
  }
}

export async function updateTenant(id: string, formData: FormData) {
  const session = await requireAuth();
  if (!session) return { error: "Unauthorized" };
  if (!hasRole(session, ["OWNER", "ADMIN", "MANAGER"])) {
    return { error: "Permission denied" };
  }

  const existing = await prisma.tenant.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!existing) return { error: "Tenant not found" };

  const raw = Object.fromEntries(formData);
  const parsed = tenantSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid data" };
  }

  await prisma.tenant.update({
    where: { id },
    data: parsed.data,
  });
  revalidatePath("/dashboard/tenants");
  return { success: true };
}
