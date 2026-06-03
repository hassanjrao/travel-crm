"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";

const supplierSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["HOTEL", "TRANSPORT", "AIRLINE", "ACTIVITY", "RESTAURANT", "OTHER"]),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  contactPerson: z.string().optional(),
  notes: z.string().optional(),
});

export async function createSupplier(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const data = Object.fromEntries(formData);
  const parsed = supplierSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  await prisma.supplier.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || undefined,
    },
  });

  revalidatePath("/suppliers");
  return { success: true };
}

export async function toggleSupplierStatus(id: string, isActive: boolean) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.supplier.update({ where: { id }, data: { isActive } });
  revalidatePath("/suppliers");
}
