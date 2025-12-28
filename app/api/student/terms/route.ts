import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const runtime = "nodejs";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ekubix_token")?.value;

  if (!token) throw new Error("Nie jesteś zalogowany");

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const client = await clientPromise;
    const db = client.db("eKubix");
    const currentUser = await db.collection("users").findOne({ _id: new ObjectId(payload.id) });
    if (!currentUser) throw new Error("Nie znaleziono użytkownika");
    return currentUser;
  } catch (err) {
    throw new Error("Nieprawidłowy token lub brak dostępu");
  }
}

// GET: pobierz wszystkie wydarzenia dla klasy ucznia
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser.class) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const eventsFromDb = await db
      .collection("terms")
      .find({ class: currentUser.class, school: currentUser.school })
      .toArray();

    // Mapujemy pola do frontendu
    const events = eventsFromDb.map((e: any) => ({
      subject: e.subject || "",
      category: e.category || "",
      date: e.date || "",
      title: e.title || "",
      content: e.content || "",
      teacher: e.senderName || "",
    }));

    return NextResponse.json({ events }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || "Błąd serwera" }, { status: 500 });
  }
}
