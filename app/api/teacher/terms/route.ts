import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const runtime = "nodejs";

// Typy
interface Term {
  _id?: ObjectId;
  class: string;
  school: string;
  subject?: string;
  category?: string;
  title?: string;
  content?: string;
  date?: string;
  senderName?: string;
  teacherId?: ObjectId;
  createdAt: Date;
}

interface User {
  _id: ObjectId;
  name: string;
  surname: string;
  role: string;
  school: string;
  class?: string;
}

// Pobranie aktualnego użytkownika
async function getCurrentUser(): Promise<User> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ekubix_token")?.value;

  if (!token) throw new Error("Nie jesteś zalogowany");

  let payload: { id: string; role: string };
  try {
    payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    throw new Error("Nieprawidłowy token lub brak dostępu");
  }

  const client = await clientPromise;
  const db = client.db("eKubix");

  const currentUser = await db
    .collection<User>("users")
    .findOne({ _id: new ObjectId(payload.id) });

  if (!currentUser) throw new Error("Nie znaleziono użytkownika");

  return currentUser;
}

// GET: pobierz wszystkie wydarzenia dla klasy i szkoły
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const className = url.searchParams.get("class");
    if (!className) {
      return NextResponse.json({ message: "Nie podano klasy" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    const client = await clientPromise;
    const db = client.db("eKubix");

    const eventsFromDb = await db
      .collection<Term>("terms")
      .find({ class: className, school: currentUser.school })
      .toArray();

    const events = eventsFromDb.map((e) => ({
      _id: e._id?.toString() || "",
      subject: e.subject || "",
      category: e.category || "",
      title: e.title || "",
      content: e.content || "",
      date: e.date || "",
      senderName: e.senderName || "",
      canDelete: e.teacherId?.toString() === currentUser._id.toString(),
    }));

    return NextResponse.json({ events }, { status: 200 });
  } catch (err: any) {
    console.error("Teacher TERMS GET ERROR:", err);
    return NextResponse.json({ message: err.message || "Błąd serwera" }, { status: 500 });
  }
}

// POST: dodaj nowe wydarzenie
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = (await req.json()) as {
      class: string;
      subject: string;
      category: string;
      title: string;
      content?: string;
      date: string;
    };

    const { class: className, subject, category, title, content, date } = body;

    if (!className || !subject || !category || !title || !date) {
      return NextResponse.json({ message: "Brak wymaganych danych" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const newTerm: Term = {
      teacherId: currentUser._id,
      senderName: `${currentUser.name} ${currentUser.surname}`,
      school: currentUser.school,
      class: className,
      subject,
      category,
      title,
      content: content || "",
      date,
      createdAt: new Date(),
    };

    const result = await db.collection<Term>("terms").insertOne(newTerm);

    return NextResponse.json(
      { message: "Wydarzenie dodane pomyślnie", id: result.insertedId.toString() },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Teacher TERMS POST ERROR:", err);
    return NextResponse.json({ message: err.message || "Błąd serwera" }, { status: 500 });
  }
}

// DELETE: usuń wydarzenie
export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const url = new URL(req.url);
    const eventId = url.searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ message: "Nie podano ID wydarzenia" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("eKubix");

    const event = await db.collection<Term>("terms").findOne({ _id: new ObjectId(eventId) });
    if (!event) return NextResponse.json({ message: "Nie znaleziono wydarzenia" }, { status: 404 });

    if (event.teacherId?.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: "Nie masz uprawnień do usunięcia tego wydarzenia" }, { status: 403 });
    }

    await db.collection<Term>("terms").deleteOne({ _id: new ObjectId(eventId) });

    return NextResponse.json({ message: "Wydarzenie usunięte pomyślnie" }, { status: 200 });
  } catch (err: any) {
    console.error("Teacher TERMS DELETE ERROR:", err);
    return NextResponse.json({ message: err.message || "Błąd serwera" }, { status: 500 });
  }
}
