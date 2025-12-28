import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

/* =========================
   Pomocnicza funkcja: pobierz admina
========================= */
async function getAdmin(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = cookie?.match(/ekubix_token=([^;]+)/)?.[1];

  if (!token) {
    throw { status: 401, message: "Brak tokenu" };
  }

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw { status: 401, message: "Nieprawidłowy token" };
  }

  const client = await clientPromise;
  const db = client.db("eKubix");

  const user = await db.collection("users").findOne({ _id: new ObjectId(payload.id) });

  if (!user) {
    throw { status: 401, message: "Użytkownik nie istnieje" };
  }

  if (user.role !== "admin") {
    throw { status: 403, message: "Brak uprawnień" };
  }

  return user;
}

/* =========================
   GET – pobierz wszystkie zgłoszenia
========================= */
export async function GET(req: Request) {
  try {
    await getAdmin(req); // teraz przekazujemy prawdziwy Request

    const client = await clientPromise;
    const db = client.db("eKubix");

    const tickets = await db
      .collection("Support")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // konwersja _id do string
    const formattedTickets = tickets.map(ticket => ({
      ...ticket,
      _id: ticket._id.toString(),
    }));

    return NextResponse.json({ tickets: formattedTickets }, { status: 200 });
  } catch (err: any) {
    console.error("ADMIN SUPPORT GET ERROR:", err);
    return NextResponse.json({ message: err.message || "Błąd serwera" }, { status: err.status || 500 });
  }
}

/* =========================
   DELETE – usuń zgłoszenie
========================= */
export async function DELETE(req: Request) {
  try {
    await getAdmin(req);

    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("id");

    if (!ticketId) {
      return NextResponse.json({ message: "Nie podano ID zgłoszenia" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const result = await db.collection("Support").deleteOne({ _id: new ObjectId(ticketId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Nie znaleziono zgłoszenia" }, { status: 404 });
    }

    return NextResponse.json({ message: "Zgłoszenie usunięte" }, { status: 200 });
  } catch (err: any) {
    console.error("ADMIN SUPPORT DELETE ERROR:", err);
    return NextResponse.json({ message: err.message || "Błąd serwera" }, { status: err.status || 500 });
  }
}
