import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ekubix_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Brak tokenu" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Nieprawidłowy token" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const studentId = new ObjectId(decoded.id);

    const student = await db.collection("users").findOne({
      _id: studentId,
      role: "student",
    });

    if (!student) {
      return NextResponse.json(
        { message: "Nie znaleziono ucznia" },
        { status: 404 }
      );
    }

    // ✅ NAJWAŻNIEJSZA POPRAWKA
    const rawAttendance = await db
      .collection("attendance")
      .find({
        $or: [
          { studentId: studentId },                 // ObjectId
          { studentId: studentId.toString() },      // string
        ],
      })
      .sort({ date: -1 })
      .toArray();

    const attendance = rawAttendance.map((a: any) => ({
      date: a.date instanceof Date
        ? a.date.toISOString().split("T")[0]
        : a.date,
      subject: a.subject || "-",
      status: a.status, // Obecny / Nieobecny / Spóźniony / Zwolniony / Nieobecność usprawiedliwiona
    }));

    return NextResponse.json(
      {
        studentName: student.name,
        attendance,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("STUDENT ATTENDANCE ERROR:", err);
    return NextResponse.json(
      { message: "Błąd serwera" },
      { status: 500 }
    );
  }
}
