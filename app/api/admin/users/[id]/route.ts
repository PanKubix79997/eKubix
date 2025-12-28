// app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

// PATCH – aktualizacja użytkownika
export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const body = await req.json();
    // body powinien zawierać pola do aktualizacji np. { email: "nowy@email.com" }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: body });

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Nie znaleziono użytkownika" }, { status: 404 });
    }

    return NextResponse.json({ message: "Użytkownik zaktualizowany" }, { status: 200 });
  } catch (err) {
    console.error("PATCH USER ERROR:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}
