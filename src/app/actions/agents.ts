"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

const agentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "AGENT"]).default("AGENT"),
});

export async function createAgent(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const data = Object.fromEntries(formData);
  const parsed = agentSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const hashed = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      phone: parsed.data.phone,
      role: parsed.data.role,
    },
  });

  revalidatePath("/agents");
  return { success: true };
}

export async function toggleAgentStatus(id: string, isActive: boolean) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({ where: { id }, data: { isActive } });
  revalidatePath("/agents");
}
