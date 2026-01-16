import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;

export const runtime = "nodejs";

interface JwtPayload {
  id: string;
  role: string;
}

interface Grade {
  _id: ObjectId;
  studentId: ObjectId;
  subject: string;
  grade: string;
  title?: string;
  content?: string;
  createdAt: Date;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ekubix_token")?.value;
    if (!token) return NextResponse.json({ message: "Nie jesteś zalogowany" }, { status: 401 });

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Nieprawidłowy token" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const studentId = new ObjectId(payload.id);

    const rawGrades = await db.collection<Grade>("grades")
      .find({ studentId })
      .sort({ createdAt: -1 })
      .toArray();

    const grades = rawGrades.map(g => ({
      subject: g.subject,
      grade: g.grade,
      date: g.createdAt.toISOString().split("T")[0],
      title: g.title || "-",
      content: g.content || "-",
    }));

    return NextResponse.json({ grades }, { status: 200 });
  } catch (err: unknown) {
    console.error("Błąd w /api/grades/received:", err);
    const message = err instanceof Error ? err.message : "Błąd serwera";
    return NextResponse.json({ message }, { status: 500 });
  }
}
