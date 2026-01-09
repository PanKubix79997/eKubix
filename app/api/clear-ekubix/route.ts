import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const POST = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ekubix_token")?.value;
    if (!token) return NextResponse.json({ message: "Nie jesteś zalogowany" }, { status: 401 });

    let payload: { role: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { role: string };
    } catch {
      return NextResponse.json({ message: "Nieprawidłowy token" }, { status: 401 });
    }

    if (!payload.role || payload.role.toLowerCase() !== "admin") {
      return NextResponse.json({ message: "Brak uprawnień" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const collectionsToClear = ["attendance", "grades", "messages", "notes", "terms"];
    for (const col of collectionsToClear) {
      await db.collection(col).deleteMany({});
    }
    await db.collection("users").deleteMany({ role: { $ne: "admin" } });

    return NextResponse.json({ message: "Baza danych została wyczyszczona pomyślnie." }, { status: 200 });
  } catch (err: unknown) {
    console.error("Clear eKubix error:", err);
    const message = err instanceof Error ? err.message : "Błąd serwera";
    return NextResponse.json({ message }, { status: 500 });
  }
};
