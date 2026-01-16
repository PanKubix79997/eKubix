import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;

export const runtime = "nodejs";

interface JwtPayload {
  id: string;
}

interface User {
  _id: ObjectId;
  name: string;
  surname: string;
  school?: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ekubix_token")?.value;
    if (!token) return NextResponse.json({ message: "Nie jesteś zalogowany" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const client = await clientPromise;
    const db = client.db("eKubix");

    const user = await db.collection<User>("users").findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { name: 1, surname: 1, school: 1 } }
    );

    if (!user) return NextResponse.json({ message: "Użytkownik nie istnieje" }, { status: 404 });

    return NextResponse.json({
      name: user.name,
      surname: user.surname,
      school: user.school || ""
    }, { status: 200 });
  } catch (err: unknown) {
    console.error("API /me ERROR:", err);
    const message = err instanceof Error ? err.message : "Błąd serwera";
    return NextResponse.json({ message }, { status: 500 });
  }
}
