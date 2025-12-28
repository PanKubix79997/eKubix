import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;
export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ekubix_token")?.value;
    if (!token) return NextResponse.json({ message: "Nie jesteś zalogowany" }, { status: 401 });

    let payload: { id: string; role: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    } catch {
      return NextResponse.json({ message: "Nieprawidłowy token" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const messages = await db.collection("messages")
      .find({ recipientId: new ObjectId(payload.id) })
      .sort({ date: -1 })
      .toArray();

    const messagesWithSender = await Promise.all(
      messages.map(async (msg) => {
        const sender = await db.collection("users").findOne({ _id: new ObjectId(msg.senderId) });
        return {
          _id: msg._id.toString(),
          senderName: sender ? `${sender.name} ${sender.surname}` : "Nieznany",
          title: msg.title,
          content: msg.content,
          date: msg.date,
        };
      })
    );

    return NextResponse.json({ messages: messagesWithSender }, { status: 200 });
  } catch (err) {
    console.error("Błąd w /api/messages/received-student GET:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}
