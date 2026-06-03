"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";

const clientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  passport: z.string().optional(),
  notes: z.string().optional(),
});

export async function createClient(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const data = Object.fromEntries(formData);
  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  await prisma.client.create({ data: parsed.data });
  revalidatePath("/clients");
  return { success: true };
}

export async function deleteClient(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
}
