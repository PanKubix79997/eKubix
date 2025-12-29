import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

/* ===================== DELETE USER ===================== */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Nieprawidłowe ID użytkownika" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Użytkownik nie istnieje" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Użytkownik został usunięty" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json(
      { message: "Błąd serwera" },
      { status: 500 }
    );
  }
}

/* ===================== PATCH USER ===================== */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Nieprawidłowe ID użytkownika" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("eKubix");

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Użytkownik nie istnieje" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Użytkownik został zaktualizowany" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH USER ERROR:", error);
    return NextResponse.json(
      { message: "Błąd serwera" },
      { status: 500 }
    );
  }
}
