"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasRole } from "@/lib/auth";
import { z } from "zod";

const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default("KE"),
  type: z
    .enum(["APARTMENT", "HOUSE", "CONDO", "TOWNHOUSE", "COMMERCIAL", "OTHER"])
    .default("APARTMENT"),
  description: z.string().optional(),
  yearBuilt: z.coerce.number().optional(),
});

const unitSchema = z.object({
  propertyId: z.string().min(1),
  unitNumber: z.string().min(1, "Unit number is required"),
  bedrooms: z.coerce.number().min(0).default(1),
  bathrooms: z.coerce.number().min(0).default(1),
  sqft: z.coerce.number().optional(),
  rentAmount: z.coerce.number().min(0, "Rent is required"),
  deposit: z.coerce.number().min(0).default(0),
  status: z
    .enum(["VACANT", "OCCUPIED", "MAINTENANCE", "RESERVED"])
    .default("VACANT"),
  description: z.string().optional(),
});

export async function createProperty(formData: FormData) {
  const session = await requireAuth();
  if (!session) return { error: "Unauthorized" };
  if (!hasRole(session, ["OWNER", "ADMIN", "MANAGER"])) {
    return { error: "Permission denied" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = propertySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid data" };
  }

  try {
    await prisma.property.create({
      data: {
        ...parsed.data,
        organizationId: session.organizationId,
      },
    });
    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create property" };
  }
}

export async function createUnit(formData: FormData) {
  const session = await requireAuth();
  if (!session) return { error: "Unauthorized" };
  if (!hasRole(session, ["OWNER", "ADMIN", "MANAGER"])) {
    return { error: "Permission denied" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = unitSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid data" };
  }

  const property = await prisma.property.findFirst({
    where: {
      id: parsed.data.propertyId,
      organizationId: session.organizationId,
    },
  });
  if (!property) return { error: "Property not found" };

  try {
    await prisma.unit.create({
      data: {
        propertyId: parsed.data.propertyId,
        unitNumber: parsed.data.unitNumber,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        sqft: parsed.data.sqft,
        rentAmount: parsed.data.rentAmount,
        deposit: parsed.data.deposit,
        status: parsed.data.status,
        description: parsed.data.description,
      },
    });
    revalidatePath("/dashboard/properties");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { error: "Unit number already exists for this property" };
    }
    console.error(e);
    return { error: "Failed to create unit" };
  }
}

export async function deleteProperty(id: string) {
  const session = await requireAuth();
  if (!session) return { error: "Unauthorized" };
  if (!hasRole(session, ["OWNER", "ADMIN"])) {
    return { error: "Permission denied" };
  }

  const property = await prisma.property.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!property) return { error: "Not found" };

  await prisma.property.delete({ where: { id } });
  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard");
  return { success: true };
}
