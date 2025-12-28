import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    // 1️⃣ Pobierz token z cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("ekubix_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Brak autoryzacji" },
        { status: 401 }
      );
    }

    // 2️⃣ Odczytaj ID ucznia z JWT
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    if (decoded.role !== "student") {
      return NextResponse.json(
        { message: "Brak dostępu" },
        { status: 403 }
      );
    }

    const studentId = new ObjectId(decoded.id);

    // 3️⃣ Połączenie z bazą
    const client = await clientPromise;
    const db = client.db("eKubix");

    // 4️⃣ Pobierz uwagi ucznia
    const notes = await db
      .collection("notes")
      .find({ studentId })
      .sort({ date: -1 })
      .toArray();

    // 5️⃣ Formatowanie pod frontend
    const formattedNotes = notes.map(note => ({
      _id: note._id.toString(),
      title: note.title,
      type: note.type,
      content: note.content,
      date: note.date,
      teacher: {
        name: note.teacher?.name || "",
        surname: note.teacher?.surname || ""
      }
    }));

    return NextResponse.json(
      { notes: formattedNotes },
      { status: 200 }
    );
  } catch (err) {
    console.error("API /student/notes ERROR:", err);
    return NextResponse.json(
      { message: "Błąd serwera" },
      { status: 500 }
    );
  }
}
