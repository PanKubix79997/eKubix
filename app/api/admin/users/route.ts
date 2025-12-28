import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies(); // <- tu dodane await
    const token = cookieStore.get("ekubix_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Brak tokenu" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Brak uprawnień" }, { status: 403 });
    }

    // Połączenie z MongoDB
    const client = await clientPromise;
    const db = client.db("eKubix");

    const users = await db
      .collection("users")
      .find({})
      .project({ password: 0 }) // 🔐 hasło nigdy nie wychodzi
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}
