"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { generateInvoiceNo } from "@/lib/utils";

const invoiceSchema = z.object({
  bookingId: z.string().min(1),
  dueDate: z.string().min(1),
  taxRate: z.string().default("0"),
  notes: z.string().optional(),
});

export async function createInvoice(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const data = Object.fromEntries(formData);
  const parsed = invoiceSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { client: true },
  });
  if (!booking) return { error: "Booking not found" };

  const subtotal = Number(booking.totalAmount);
  const taxRate = Number(parsed.data.taxRate);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  await prisma.invoice.create({
    data: {
      invoiceNo: generateInvoiceNo(),
      bookingId: parsed.data.bookingId,
      clientId: booking.clientId,
      dueDate: new Date(parsed.data.dueDate),
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/invoices");
  return { success: true };
}

export async function updateInvoiceStatus(id: string, status: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.invoice.update({
    where: { id },
    data: { status: status as never },
  });

  revalidatePath("/invoices");
}

const paymentSchema = z.object({
  bookingId: z.string().min(1),
  invoiceId: z.string().optional(),
  amount: z.string().min(1),
  method: z.string().min(1),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export async function addPayment(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const data = Object.fromEntries(formData);
  const parsed = paymentSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const amount = Number(parsed.data.amount);
  const booking = await prisma.booking.findUnique({ where: { id: parsed.data.bookingId } });
  if (!booking) return { error: "Booking not found" };

  const newPaid = Number(booking.paidAmount) + amount;
  const total = Number(booking.totalAmount);
  const paymentStatus = newPaid >= total ? "PAID" : "PARTIAL";

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        bookingId: parsed.data.bookingId,
        invoiceId: parsed.data.invoiceId || undefined,
        amount,
        method: parsed.data.method,
        reference: parsed.data.reference,
        notes: parsed.data.notes,
      },
    }),
    prisma.booking.update({
      where: { id: parsed.data.bookingId },
      data: { paidAmount: newPaid, paymentStatus: paymentStatus as never },
    }),
  ]);

  if (parsed.data.invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: parsed.data.invoiceId } });
    if (invoice && newPaid >= Number(invoice.totalAmount)) {
      await prisma.invoice.update({
        where: { id: parsed.data.invoiceId },
        data: { status: "PAID" },
      });
    }
  }

  revalidatePath("/invoices");
  revalidatePath("/payments");
  return { success: true };
}
