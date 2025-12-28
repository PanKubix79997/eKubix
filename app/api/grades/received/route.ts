import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ekubix_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Nie jesteś zalogowany" },
        { status: 401 }
      );
    }

    let payload: { id: string; role: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as {
        id: string;
        role: string;
      };
    } catch {
      return NextResponse.json(
        { message: "Nieprawidłowy token" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const studentId = new ObjectId(payload.id);

    const rawGrades = await db
      .collection("grades")
      .find({ studentId })
      .sort({ createdAt: -1 })
      .toArray();

    const grades = rawGrades.map((g: any) => ({
      subject: g.subject,
      grade: g.grade,
      date: g.createdAt
        ? g.createdAt.toISOString().split("T")[0]
        : "-",
      title: g.title || "-",
      content: g.content || "-",
    }));

    return NextResponse.json({ grades }, { status: 200 });
  } catch (err) {
    console.error("Błąd w /api/grades/received:", err);
    return NextResponse.json(
      { message: "Błąd serwera" },
      { status: 500 }
    );
  }
}
