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

// GET: pobierz wszystkie wydarzenia dla klasy i szkoły
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const className = url.searchParams.get("class");
    if (!className) return NextResponse.json({ message: "Nie podano klasy" }, { status: 400 });

    const currentUser = await getCurrentUser();
    const client = await clientPromise;
    const db = client.db("eKubix");

    const eventsFromDb = await db
      .collection("terms")
      .find({ class: className, school: currentUser.school })
      .toArray();

    // Mapowanie pól zgodnie z front-endem
    const events = eventsFromDb.map((e: any) => ({
      _id: e._id.toString(),
      subject: e.subject || "",      // faktyczny przedmiot
      category: e.category || "",    // kategoria wydarzenia
      title: e.title || "",
      content: e.content || "",
      date: e.date || "",
      senderName: e.senderName || "",
      canDelete: e.teacherId?.toString() === currentUser._id.toString(),
    }));

    return NextResponse.json({ events }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || "Błąd serwera" }, { status: 500 });
  }
}

// POST: dodaj nowe wydarzenie
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();

    const { class: className, subject, category, title, content, date } = body;

    if (!className || !subject || !category || !title || !date) {
      return NextResponse.json({ message: "Brak wymaganych danych" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const result = await db.collection("terms").insertOne({
      teacherId: new ObjectId(currentUser._id),
      senderName: `${currentUser.name} ${currentUser.surname}`,
      school: currentUser.school,
      class: className,
      subject: subject,
      category: category,
      title: title,
      content: content || "",
      date: date,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Wydarzenie dodane pomyślnie", id: result.insertedId }, { status: 200 });
  } catch (err: any) {
    console.error(err);
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

    const event = await db.collection("terms").findOne({ _id: new ObjectId(eventId) });
    if (!event) return NextResponse.json({ message: "Nie znaleziono wydarzenia" }, { status: 404 });

    const teacherIdStr = event.teacherId instanceof ObjectId ? event.teacherId.toString() : event.teacherId || "";

    if (teacherIdStr !== currentUser._id.toString()) {
      return NextResponse.json({ message: "Nie masz uprawnień do usunięcia tego wydarzenia" }, { status: 403 });
    }

    await db.collection("terms").deleteOne({ _id: new ObjectId(eventId) });

    return NextResponse.json({ message: "Wydarzenie usunięte pomyślnie" }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message || "Błąd serwera" }, { status: 500 });
  }
}
