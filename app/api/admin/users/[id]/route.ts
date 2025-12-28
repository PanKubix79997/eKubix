import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Połączenie z MongoDB
    const client = await clientPromise;
    const db = client.db("eKubix");

    if (!db) {
      throw new Error("MongoDB nie jest połączone");
    }

    const { id } = params;

    await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      { message: "Użytkownik został usunięty" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}
