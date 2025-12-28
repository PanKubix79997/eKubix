import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

// GET: pobierz wszystkie uwagi danego ucznia
export async function GET(req: Request) {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("eKubix");

    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ message: "Brak ID ucznia", success: false }, { status: 400 });
    }

    const notes = await db
      .collection("notes")
      .find({ studentId: new ObjectId(studentId) })
      .sort({ date: -1 })
      .toArray();

    const formatted = notes.map(n => ({
      ...n,
      _id: n._id.toString(),
      studentId: n.studentId.toString(),
    }));

    return NextResponse.json({ message: "Pobrano uwagi", success: true, notes: formatted });
  } catch (err) {
    console.error("GET NOTES ERROR:", err);
    return NextResponse.json({ message: "Błąd serwera", success: false }, { status: 500 });
  }
}

// POST: dodaj nową uwagę wraz z nauczycielem
export async function POST(req: Request) {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("eKubix");

    const body = await req.json();
    const { studentId, class: selectedClass, title, type, content, date, teacher } = body;

    if (!studentId || !selectedClass || !title || !type || !content || !date || !teacher) {
      return NextResponse.json({ message: "Brak wymaganych danych", success: false }, { status: 400 });
    }

    const newNote = {
      studentId: new ObjectId(studentId),
      class: selectedClass,
      title,
      type,
      content,
      date: new Date(date),
      teacher, // zapisujemy nauczyciela
    };

    const result = await db.collection("notes").insertOne(newNote);

    if (!result.insertedId) {
      return NextResponse.json({ message: "Nie udało się dodać uwagi", success: false }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Uwaga dodana", 
      success: true, 
      note: { ...newNote, _id: result.insertedId.toString() } 
    });
  } catch (err) {
    console.error("POST NOTES ERROR:", err);
    return NextResponse.json({ message: "Błąd serwera", success: false }, { status: 500 });
  }
}
