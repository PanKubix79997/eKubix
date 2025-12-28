// app/api/support/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // walidacja podstawowa
    if (!body.reason || !body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { message: "Niepoprawne dane formularza" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    // zapis do kolekcji support
    const result = await db.collection("Support").insertOne({
      reason: body.reason,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      confirmEmail: body.confirmEmail || null,
      phone: body.phone || null,
      title: body.title || null,
      description: body.description || null,
      schoolName: body.schoolName || null,
      birthDate: body.birthDate || null,
      registerReason: body.registerReason || null,
      peselDigits: body.peselDigits || null,
      NIP: body.NIP || null,
      REGON: body.REGON || null,
      country: body.country || null,
      region: body.region || null,
      city: body.city || null,
      street: body.street || null,
      postalCode: body.postalCode || null,
      plan: body.plan || null,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Zgłoszenie wysłane poprawnie", id: result.insertedId },
      { status: 201 }
    );
  } catch (err) {
    console.error("Support API error:", err);
    return NextResponse.json(
      { message: "Błąd serwera – spróbuj ponownie później" },
      { status: 500 }
    );
  }
}
