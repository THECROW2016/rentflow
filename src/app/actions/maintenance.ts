"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasRole } from "@/lib/auth";
import { z } from "zod";

const ticketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  category: z.string().optional(),
  leaseId: z.string().optional(),
});

export async function createMaintenanceTicket(formData: FormData) {
  const session = await requireAuth();
  if (!session) return { error: "Unauthorized" };
  if (!hasRole(session, ["OWNER", "ADMIN", "MANAGER", "STAFF"])) {
    return { error: "Permission denied" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = ticketSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid data" };
  }

  if (parsed.data.leaseId) {
    const lease = await prisma.lease.findFirst({
      where: { id: parsed.data.leaseId, organizationId: session.organizationId },
    });
    if (!lease) return { error: "Lease not found" };
  }

  try {
    await prisma.maintenanceRequest.create({
      data: {
        organizationId: session.organizationId,
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        category: parsed.data.category || null,
        leaseId: parsed.data.leaseId || null,
        status: "OPEN",
      },
    });

    revalidatePath("/dashboard/maintenance");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create ticket" };
  }
}

export async function updateMaintenanceStatus(
  id: string,
  status: "OPEN" | "IN_PROGRESS" | "WAITING_PARTS" | "COMPLETED" | "CANCELLED"
) {
  const session = await requireAuth();
  if (!session) return { error: "Unauthorized" };
  if (!hasRole(session, ["OWNER", "ADMIN", "MANAGER", "STAFF"])) {
    return { error: "Permission denied" };
  }

  const ticket = await prisma.maintenanceRequest.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!ticket) return { error: "Ticket not found" };

  await prisma.maintenanceRequest.update({
    where: { id },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
      assignedToId:
        status === "IN_PROGRESS" && !ticket.assignedToId
          ? session.id
          : ticket.assignedToId,
    },
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard");
  return { success: true };
}
