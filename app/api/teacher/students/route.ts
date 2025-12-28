import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("class");

    if (!className) return NextResponse.json({ students: [] });

    const client = await clientPromise;
    const db = client.db();

    const students = await db
      .collection("users")
      .find({ role: "student", class: className })
      .project({ name: 1, surname: 1 })
      .toArray();

    return NextResponse.json({ students });
  } catch (err) {
    console.error("Błąd w /api/teacher/students:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}
