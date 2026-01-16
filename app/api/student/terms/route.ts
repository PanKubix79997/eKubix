import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const runtime = "nodejs";

interface JwtPayload {
  id: string;
  role: string;
}

interface User {
  _id: ObjectId;
  class?: string;
  school?: string;
}

interface Term {
  _id: ObjectId;
  subject?: string;
  category?: string;
  date?: string;
  title?: string;
  content?: string;
  senderName?: string;
  class?: string;
  school?: string;
}

// Pomocnicza funkcja – pobranie aktualnego użytkownika
async function getCurrentUser(): Promise<User> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ekubix_token")?.value;
  if (!token) throw new Error("Nie jesteś zalogowany");

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const client = await clientPromise;
    const db = client.db("eKubix");

    const user = await db.collection<User>("users").findOne({ _id: new ObjectId(payload.id) });
    if (!user) throw new Error("Nie znaleziono użytkownika");

    return user;
  } catch {
    throw new Error("Nieprawidłowy token lub brak dostępu");
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser.class) {
      return NextResponse.json({ events: [] }, { status: 200 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const termsFromDb = await db.collection<Term>("terms").find({
      class: currentUser.class,
      school: currentUser.school
    }).toArray();

    const events = termsFromDb.map(term => ({
      subject: term.subject || "",
      category: term.category || "",
      date: term.date || "",
      title: term.title || "",
      content: term.content || "",
      teacher: term.senderName || "",
    }));

    return NextResponse.json({ events }, { status: 200 });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Błąd serwera";
    return NextResponse.json({ message }, { status: 500 });
  }
}
