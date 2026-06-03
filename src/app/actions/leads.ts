"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";

const leadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CONVERTED", "LOST"]).optional(),
  notes: z.string().optional(),
  budget: z.string().optional(),
  destination: z.string().optional(),
  groupSize: z.string().optional(),
});

export async function createLead(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const data = Object.fromEntries(formData);
  const parsed = leadSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  await prisma.lead.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      source: parsed.data.source,
      notes: parsed.data.notes,
      destination: parsed.data.destination,
      groupSize: parsed.data.groupSize ? parseInt(parsed.data.groupSize) : undefined,
      budget: parsed.data.budget ? parsed.data.budget : undefined,
      assignedToId: session.user?.id,
    },
  });

  revalidatePath("/leads");
  return { success: true };
}

export async function updateLeadStatus(id: string, status: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.lead.update({
    where: { id },
    data: { status: status as never },
  });

  revalidatePath("/leads");
}

export async function deleteLead(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
}
