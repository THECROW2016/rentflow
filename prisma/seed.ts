import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding RentFlow demo data...");

  await prisma.maintenanceRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  const org = await prisma.organization.create({
    data: {
      name: "Amani Properties Ltd",
      slug: "amani-properties",
      email: "info@amaniproperties.co.ke",
      phone: "+254712345678",
      address: "Westlands, Nairobi",
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@amaniproperties.co.ke",
      passwordHash,
      firstName: "James",
      lastName: "Mwangi",
      phone: "+254700000001",
    },
  });

  await prisma.organizationMember.create({
    data: { organizationId: org.id, userId: owner.id, role: "OWNER" },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@amaniproperties.co.ke",
      passwordHash,
      firstName: "Grace",
      lastName: "Wanjiku",
      phone: "+254700000002",
    },
  });

  await prisma.organizationMember.create({
    data: { organizationId: org.id, userId: manager.id, role: "MANAGER" },
  });

  const prop1 = await prisma.property.create({
    data: {
      organizationId: org.id,
      name: "Kilimani Heights",
      address: "Argwings Kodhek Road",
      city: "Nairobi",
      state: "Nairobi",
      zipCode: "00100",
      country: "KE",
      type: "APARTMENT",
      description: "Modern apartment complex in Kilimani",
      yearBuilt: 2019,
    },
  });

  const units = await Promise.all([
    prisma.unit.create({
      data: {
        propertyId: prop1.id,
        unitNumber: "A1",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 950,
        rentAmount: 65000,
        deposit: 130000,
        status: "OCCUPIED",
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: prop1.id,
        unitNumber: "A2",
        bedrooms: 1,
        bathrooms: 1,
        sqft: 650,
        rentAmount: 45000,
        deposit: 90000,
        status: "OCCUPIED",
      },
    }),
    prisma.unit.create({
      data: {
        propertyId: prop1.id,
        unitNumber: "B1",
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 1400,
        rentAmount: 95000,
        deposit: 190000,
        status: "VACANT",
      },
    }),
  ]);

  const tenant1 = await prisma.tenant.create({
    data: {
      organizationId: org.id,
      firstName: "Peter",
      lastName: "Kamau",
      email: "peter.kamau@email.com",
      phone: "+254711111111",
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      organizationId: org.id,
      firstName: "Sarah",
      lastName: "Otieno",
      email: "sarah.otieno@email.com",
      phone: "+254733333333",
    },
  });

  const now = new Date();
  const lease1 = await prisma.lease.create({
    data: {
      organizationId: org.id,
      unitId: units[0].id,
      tenantId: tenant1.id,
      createdById: owner.id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1),
      endDate: new Date(now.getFullYear() + 1, now.getMonth() - 6, 1),
      rentAmount: 65000,
      depositAmount: 130000,
      paymentDueDay: 5,
      status: "ACTIVE",
    },
  });

  await prisma.lease.create({
    data: {
      organizationId: org.id,
      unitId: units[1].id,
      tenantId: tenant2.id,
      createdById: manager.id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
      endDate: new Date(now.getFullYear() + 1, now.getMonth() - 3, 1),
      rentAmount: 45000,
      depositAmount: 90000,
      paymentDueDay: 1,
      status: "ACTIVE",
    },
  });

  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 5);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 5);

  await prisma.payment.createMany({
    data: [
      {
        organizationId: org.id,
        leaseId: lease1.id,
        amount: 65000,
        type: "RENT",
        status: "PAID",
        dueDate: lastMonth,
        paidAt: lastMonth,
        method: "M-Pesa",
        reference: "QK12ABCDE",
      },
      {
        organizationId: org.id,
        leaseId: lease1.id,
        amount: 65000,
        type: "RENT",
        status: "PENDING",
        dueDate: thisMonth,
      },
    ],
  });

  await prisma.maintenanceRequest.create({
    data: {
      organizationId: org.id,
      leaseId: lease1.id,
      title: "Leaking kitchen sink",
      description: "Water dripping under the sink. Needs plumber.",
      priority: "HIGH",
      status: "OPEN",
      category: "Plumbing",
    },
  });

  console.log("Seed complete!");
  console.log("Demo accounts (password: password123):");
  console.log("  Owner:   owner@amaniproperties.co.ke");
  console.log("  Manager: manager@amaniproperties.co.ke");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
