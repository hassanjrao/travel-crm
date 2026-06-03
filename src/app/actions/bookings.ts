"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { generateBookingRef } from "@/lib/utils";

const bookingSchema = z.object({
  clientId: z.string().min(1),
  tourId: z.string().min(1),
  travelDate: z.string().min(1),
  returnDate: z.string().optional(),
  groupSize: z.string().default("1"),
  totalAmount: z.string().min(1),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
});

export async function createBooking(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const data = Object.fromEntries(formData);
  const parsed = bookingSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  await prisma.booking.create({
    data: {
      bookingRef: generateBookingRef(),
      clientId: parsed.data.clientId,
      tourId: parsed.data.tourId,
      travelDate: new Date(parsed.data.travelDate),
      returnDate: parsed.data.returnDate ? new Date(parsed.data.returnDate) : undefined,
      groupSize: parseInt(parsed.data.groupSize),
      totalAmount: parsed.data.totalAmount,
      agentId: session.user?.id,
      specialRequests: parsed.data.specialRequests,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/bookings");
  return { success: true };
}

export async function updateBookingStatus(id: string, status: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.booking.update({
    where: { id },
    data: { status: status as never },
  });

  revalidatePath("/bookings");
}

export async function recordPayment(bookingId: string, amount: number, method: string, reference?: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { error: "Booking not found" };

  const newPaid = Number(booking.paidAmount) + amount;
  const total = Number(booking.totalAmount);
  const paymentStatus = newPaid >= total ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID";

  await prisma.$transaction([
    prisma.payment.create({
      data: { bookingId, amount, method, reference },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: { paidAmount: newPaid, paymentStatus: paymentStatus as never },
    }),
  ]);

  revalidatePath("/bookings");
  return { success: true };
}
