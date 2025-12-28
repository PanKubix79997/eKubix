import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipientId, title, content, date } = body;

    if (!recipientId || !title || !content || !date) {
      return NextResponse.json({ message: "Nieprawidłowe dane" }, { status: 400 });
    }

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

    await db.collection("messages").insertOne({
      senderId: new ObjectId(payload.id),
      recipientId: new ObjectId(recipientId),
      title,
      content,
      date,
    });

    return NextResponse.json({ message: "Wiadomość wysłana pomyślnie" }, { status: 200 });
  } catch (err) {
    console.error("Błąd w /api/messages/teacher POST:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}
