"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";

const tourSchema = z.object({
  title: z.string().min(1),
  destinationId: z.string().min(1),
  description: z.string().optional(),
  duration: z.string().min(1),
  maxGroupSize: z.string().default("15"),
  pricePerPerson: z.string().min(1),
  imageUrl: z.string().optional(),
});

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString(36);
}

export async function createTour(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const data = Object.fromEntries(formData);
  const parsed = tourSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  await prisma.tour.create({
    data: {
      title: parsed.data.title,
      slug: slugify(parsed.data.title),
      destinationId: parsed.data.destinationId,
      description: parsed.data.description,
      duration: parseInt(parsed.data.duration),
      maxGroupSize: parseInt(parsed.data.maxGroupSize),
      pricePerPerson: parsed.data.pricePerPerson,
      imageUrl: parsed.data.imageUrl,
    },
  });

  revalidatePath("/tours");
  return { success: true };
}

export async function toggleTourStatus(id: string, isActive: boolean) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.tour.update({ where: { id }, data: { isActive } });
  revalidatePath("/tours");
}

export async function createDestination(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const country = formData.get("country") as string;
  const description = formData.get("description") as string | undefined;

  if (!name || !country) return { error: "Invalid data" };

  await prisma.destination.create({ data: { name, country, description } });
  revalidatePath("/destinations");
  return { success: true };
}
