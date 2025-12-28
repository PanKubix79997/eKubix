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
    if (!token) return NextResponse.json({ message: "Nie jesteś zalogowany" }, { status: 401 });

    let payload: { id: string; role: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    } catch {
      return NextResponse.json({ message: "Nieprawidłowy token" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const currentUser = await db.collection("users").findOne({ _id: new ObjectId(payload.id) });
    if (!currentUser || !currentUser.school) {
      return NextResponse.json({ message: "Nie znaleziono szkoły użytkownika" }, { status: 404 });
    }

    const recipients = await db.collection("users")
      .find({
        school: currentUser.school,
        _id: { $ne: currentUser._id },
        role: { $in: ["teacher", "director"] }
      })
      .project({ name: 1, surname: 1, role: 1 })
      .toArray();

    return NextResponse.json({ users: recipients }, { status: 200 });
  } catch (err) {
    console.error("Błąd w /api/users/recipients-school/student:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}
