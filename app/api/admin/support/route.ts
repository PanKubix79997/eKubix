import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId, DeleteResult } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
  id: string;
  role: string;
}

interface SupportTicket {
  _id: ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  senderId: ObjectId;
  senderName: string;
}

interface User {
  _id: ObjectId;
  role: string;
  name: string;
  surname: string;
}

async function getAdmin(req: Request): Promise<User> {
  const cookie = req.headers.get("cookie");
  const token = cookie?.match(/ekubix_token=([^;]+)/)?.[1];

  if (!token) throw { status: 401, message: "Brak tokenu" };

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    throw { status: 401, message: "Nieprawidłowy token" };
  }

  const client = await clientPromise;
  const db = client.db("eKubix");

  const user = await db.collection<User>("users").findOne({ _id: new ObjectId(payload.id) });
  if (!user) throw { status: 401, message: "Użytkownik nie istnieje" };
  if (user.role !== "admin") throw { status: 403, message: "Brak uprawnień" };

  return user;
}

export async function GET(req: Request) {
  try {
    await getAdmin(req);

    const client = await clientPromise;
    const db = client.db("eKubix");

    const tickets = await db.collection<SupportTicket>("Support")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedTickets = tickets.map(ticket => ({
      _id: ticket._id.toString(),
      title: ticket.title,
      content: ticket.content,
      createdAt: ticket.createdAt.toISOString(),
      senderId: ticket.senderId.toString(),
      senderName: ticket.senderName,
    }));

    return NextResponse.json({ tickets: formattedTickets }, { status: 200 });
  } catch (err: unknown) {
    console.error("ADMIN SUPPORT GET ERROR:", err);
    const message = err instanceof Error ? err.message : "Błąd serwera";
    const status = typeof err === "object" && err !== null && "status" in err
      ? (err as { status: number }).status
      : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    await getAdmin(req);

    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("id");
    if (!ticketId) return NextResponse.json({ message: "Nie podano ID zgłoszenia" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("eKubix");

    const result: DeleteResult = await db.collection("Support").deleteOne({ _id: new ObjectId(ticketId) });
    if (result.deletedCount === 0) return NextResponse.json({ message: "Nie znaleziono zgłoszenia" }, { status: 404 });

    return NextResponse.json({ message: "Zgłoszenie usunięte" }, { status: 200 });
  } catch (err: unknown) {
    console.error("ADMIN SUPPORT DELETE ERROR:", err);
    const message = err instanceof Error ? err.message : "Błąd serwera";
    const status = typeof err === "object" && err !== null && "status" in err
      ? (err as { status: number }).status
      : 500;
    return NextResponse.json({ message }, { status });
  }
}
