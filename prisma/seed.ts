import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@travelcrm.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@travelcrm.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "+1 555-0100",
    },
  });

  // Sales agent
  const agentPassword = await bcrypt.hash("agent1234", 12);
  const agent = await prisma.user.upsert({
    where: { email: "sarah@travelcrm.com" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "sarah@travelcrm.com",
      password: agentPassword,
      role: "AGENT",
      phone: "+1 555-0101",
    },
  });

  // Destinations
  const destinations = await Promise.all([
    prisma.destination.upsert({
      where: { id: "dest-bali" },
      update: {},
      create: {
        id: "dest-bali",
        name: "Bali",
        country: "Indonesia",
        description: "Island of the Gods — temples, rice terraces, and world-class beaches.",
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-paris" },
      update: {},
      create: {
        id: "dest-paris",
        name: "Paris",
        country: "France",
        description: "The City of Light — art, culture, fashion, and the Eiffel Tower.",
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-safari" },
      update: {},
      create: {
        id: "dest-safari",
        name: "Serengeti",
        country: "Tanzania",
        description: "Africa's greatest wildlife spectacle.",
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-dubai" },
      update: {},
      create: {
        id: "dest-dubai",
        name: "Dubai",
        country: "UAE",
        description: "Ultra-modern city with luxury shopping, iconic skyscrapers, and desert adventures.",
      },
    }),
  ]);

  // Tours
  const baliTour = await prisma.tour.upsert({
    where: { slug: "bali-cultural-discovery" },
    update: {},
    create: {
      title: "Bali Cultural Discovery",
      slug: "bali-cultural-discovery",
      destinationId: destinations[0].id,
      description: "An immersive 7-day journey through Bali's temples, rice terraces, and local villages.",
      duration: 7,
      maxGroupSize: 12,
      pricePerPerson: 1299,
      includes: ["Hotel (5 nights)", "Daily breakfast", "Airport transfers", "English-speaking guide"],
      excludes: ["International flights", "Travel insurance", "Personal expenses"],
      highlights: ["Uluwatu Temple sunset", "Tegalalang Rice Terraces", "Ubud Monkey Forest"],
    },
  });

  const parisTour = await prisma.tour.upsert({
    where: { slug: "paris-romantic-escape" },
    update: {},
    create: {
      title: "Paris Romantic Escape",
      slug: "paris-romantic-escape",
      destinationId: destinations[1].id,
      description: "5 magical days in Paris — Eiffel Tower, Louvre, Seine cruise and more.",
      duration: 5,
      maxGroupSize: 20,
      pricePerPerson: 1899,
      includes: ["4-star hotel", "Breakfast daily", "Skip-the-line Louvre tickets", "Seine river cruise"],
      excludes: ["Flights", "Lunches and dinners", "Personal shopping"],
      highlights: ["Eiffel Tower guided tour", "Louvre Museum", "Versailles Day Trip"],
    },
  });

  const safariTour = await prisma.tour.upsert({
    where: { slug: "serengeti-safari-adventure" },
    update: {},
    create: {
      title: "Serengeti Safari Adventure",
      slug: "serengeti-safari-adventure",
      destinationId: destinations[2].id,
      description: "10-day luxury safari through Tanzania's most breathtaking game reserves.",
      duration: 10,
      maxGroupSize: 8,
      pricePerPerson: 3999,
      includes: ["Luxury tented camp (all-inclusive)", "Game drives twice daily", "Park fees", "Transfers"],
      excludes: ["International flights", "Visa fees", "Gratuities"],
      highlights: ["Great Migration", "Big Five tracking", "Ngorongoro Crater"],
    },
  });

  // Clients
  const client1 = await prisma.client.upsert({
    where: { email: "john.smith@email.com" },
    update: {},
    create: {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@email.com",
      phone: "+1 555-0201",
      city: "New York",
      country: "USA",
      passport: "US123456789",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { email: "emma.wilson@email.com" },
    update: {},
    create: {
      firstName: "Emma",
      lastName: "Wilson",
      email: "emma.wilson@email.com",
      phone: "+44 7700 900123",
      city: "London",
      country: "UK",
    },
  });

  const client3 = await prisma.client.upsert({
    where: { email: "carlos.rodriguez@email.com" },
    update: {},
    create: {
      firstName: "Carlos",
      lastName: "Rodriguez",
      email: "carlos.rodriguez@email.com",
      phone: "+34 612 345 678",
      city: "Madrid",
      country: "Spain",
    },
  });

  // Bookings
  const booking1 = await prisma.booking.upsert({
    where: { bookingRef: "BK-DEMO-001" },
    update: {},
    create: {
      bookingRef: "BK-DEMO-001",
      clientId: client1.id,
      tourId: baliTour.id,
      agentId: agent.id,
      status: "CONFIRMED",
      travelDate: new Date("2026-08-15"),
      returnDate: new Date("2026-08-22"),
      groupSize: 2,
      totalAmount: 2598,
      paidAmount: 2598,
      paymentStatus: "PAID",
    },
  });

  const booking2 = await prisma.booking.upsert({
    where: { bookingRef: "BK-DEMO-002" },
    update: {},
    create: {
      bookingRef: "BK-DEMO-002",
      clientId: client2.id,
      tourId: safariTour.id,
      agentId: admin.id,
      status: "PENDING",
      travelDate: new Date("2026-09-01"),
      returnDate: new Date("2026-09-11"),
      groupSize: 4,
      totalAmount: 15996,
      paidAmount: 5000,
      paymentStatus: "PARTIAL",
    },
  });

  const booking3 = await prisma.booking.upsert({
    where: { bookingRef: "BK-DEMO-003" },
    update: {},
    create: {
      bookingRef: "BK-DEMO-003",
      clientId: client3.id,
      tourId: parisTour.id,
      agentId: agent.id,
      status: "CONFIRMED",
      travelDate: new Date("2026-07-10"),
      returnDate: new Date("2026-07-15"),
      groupSize: 2,
      totalAmount: 3798,
      paidAmount: 0,
      paymentStatus: "UNPAID",
    },
  });

  // Invoice for booking 1
  await prisma.invoice.upsert({
    where: { bookingId: booking1.id },
    update: {},
    create: {
      invoiceNo: "INV-2026-0001",
      bookingId: booking1.id,
      clientId: client1.id,
      status: "PAID",
      dueDate: new Date("2026-07-01"),
      subtotal: 2598,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 2598,
    },
  });

  // Payment for booking 1
  await prisma.payment.upsert({
    where: { id: "pay-demo-001" },
    update: {},
    create: {
      id: "pay-demo-001",
      bookingId: booking1.id,
      amount: 2598,
      method: "Bank Transfer",
      reference: "TRF-2026-0001",
    },
  });

  // Partial payment for booking 2
  await prisma.payment.upsert({
    where: { id: "pay-demo-002" },
    update: {},
    create: {
      id: "pay-demo-002",
      bookingId: booking2.id,
      amount: 5000,
      method: "Credit Card",
      reference: "CC-2026-0002",
    },
  });

  // Leads
  await Promise.all([
    prisma.lead.upsert({
      where: { id: "lead-001" },
      update: {},
      create: {
        id: "lead-001",
        firstName: "Alice",
        lastName: "Chen",
        email: "alice.chen@email.com",
        phone: "+1 555-0301",
        source: "Website",
        status: "QUALIFIED",
        destination: "Bali",
        budget: 3000,
        groupSize: 2,
        assignedToId: agent.id,
      },
    }),
    prisma.lead.upsert({
      where: { id: "lead-002" },
      update: {},
      create: {
        id: "lead-002",
        firstName: "Mohammed",
        lastName: "Al-Rashid",
        email: "m.rashid@email.com",
        phone: "+971 50 123 4567",
        source: "Referral",
        status: "PROPOSAL",
        destination: "Serengeti",
        budget: 20000,
        groupSize: 6,
        assignedToId: admin.id,
      },
    }),
    prisma.lead.upsert({
      where: { id: "lead-003" },
      update: {},
      create: {
        id: "lead-003",
        firstName: "Yuki",
        lastName: "Tanaka",
        email: "yuki.tanaka@email.com",
        source: "Instagram",
        status: "NEW",
        destination: "Paris",
        budget: 5000,
        groupSize: 2,
        assignedToId: agent.id,
      },
    }),
    prisma.lead.upsert({
      where: { id: "lead-004" },
      update: {},
      create: {
        id: "lead-004",
        firstName: "Robert",
        lastName: "Brown",
        email: "r.brown@email.com",
        source: "Google Ads",
        status: "CONVERTED",
        destination: "Bali",
        budget: 2600,
        groupSize: 2,
        assignedToId: agent.id,
      },
    }),
  ]);

  // Suppliers
  await Promise.all([
    prisma.supplier.upsert({
      where: { id: "sup-001" },
      update: {},
      create: {
        id: "sup-001",
        name: "Grand Hyatt Bali",
        type: "HOTEL",
        email: "reservations@grandhyattbali.com",
        phone: "+62 361 771234",
        country: "Indonesia",
        contactPerson: "Made Suardana",
      },
    }),
    prisma.supplier.upsert({
      where: { id: "sup-002" },
      update: {},
      create: {
        id: "sup-002",
        name: "Emirates Airlines",
        type: "AIRLINE",
        email: "b2b@emirates.com",
        country: "UAE",
        contactPerson: "Travel Desk",
      },
    }),
    prisma.supplier.upsert({
      where: { id: "sup-003" },
      update: {},
      create: {
        id: "sup-003",
        name: "Serengeti Luxury Camps",
        type: "HOTEL",
        email: "bookings@serengetiluxury.co.tz",
        country: "Tanzania",
        contactPerson: "David Kimani",
      },
    }),
    prisma.supplier.upsert({
      where: { id: "sup-004" },
      update: {},
      create: {
        id: "sup-004",
        name: "Paris Express Transfers",
        type: "TRANSPORT",
        email: "info@parisexpress.fr",
        country: "France",
        contactPerson: "Jean-Pierre Martin",
      },
    }),
  ]);

  console.log("✅ Seed complete!");
  console.log("   Admin: admin@travelcrm.com / admin1234");
  console.log("   Agent: sarah@travelcrm.com / agent1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
