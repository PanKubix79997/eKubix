import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, class: studentClass, subject, grade, category, title, content } = body;

    if (!studentId || !studentClass || !subject || !grade || !category || !title || !content) {
      return NextResponse.json({ message: "Wypełnij wszystkie pola" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const newGrade = {
      studentId: new ObjectId(studentId),
      class: studentClass,
      subject,
      grade,
      category,
      title,
      content,
      createdAt: new Date()
    };

    const result = await db.collection("grades").insertOne(newGrade);

    return NextResponse.json({ message: "Ocena dodana pomyślnie", gradeId: result.insertedId }, { status: 200 });

  } catch (err) {
    console.error("Błąd w /api/grades/add:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}
