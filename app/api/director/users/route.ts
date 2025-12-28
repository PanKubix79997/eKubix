import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

/* =========================
   POMOCNICZA: pobierz zalogowanego dyrektora
========================= */
async function getDirector(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = cookie?.match(/ekubix_token=([^;]+)/)?.[1];

  if (!token) throw { status: 401, message: "Brak tokenu" };

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw { status: 401, message: "Nieprawidłowy token" };
  }

  const client = await clientPromise;
  const db = client.db("eKubix");

  const user = await db.collection("users").findOne({ _id: new ObjectId(payload.id) });

  if (!user) throw { status: 401, message: "Użytkownik nie istnieje" };
  if (user.role !== "director") throw { status: 403, message: "Brak uprawnień" };

  return user;
}

/* =========================
   GET – pobierz wszystkich użytkowników szkoły dyrektora
========================= */
export async function GET(req: Request) {
  try {
    const director = await getDirector(req);

    const client = await clientPromise;
    const db = client.db("eKubix");

    const users = await db
      .collection("users")
      .find({ school: director.school })
      .project({ name: 1, surname: 1, login: 1, role: 1 })
      .toArray();

    return NextResponse.json(
      {
        users: users.map((u) => ({
          _id: u._id.toString(),
          name: u.name,
          surname: u.surname,
          login: u.login,
          role: u.role,
        })),
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("DIRECTOR GET USERS ERROR:", err);
    return NextResponse.json(
      { message: err.message || "Błąd serwera" },
      { status: err.status || 500 }
    );
  }
}

/* =========================
   DELETE – usuń konto użytkownika po userId
========================= */
export async function DELETE(req: Request) {
  try {
    const director = await getDirector(req);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "Nie podano ID użytkownika" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ message: "Nie znaleziono użytkownika" }, { status: 404 });
    }

    if (user.school !== director.school) {
      return NextResponse.json({ message: "Brak uprawnień do usunięcia tego konta" }, { status: 403 });
    }

    await db.collection("users").deleteOne({ _id: new ObjectId(userId) });

    return NextResponse.json({ message: "Użytkownik usunięty" }, { status: 200 });
  } catch (err: any) {
    console.error("DIRECTOR DELETE USER ERROR:", err);
    return NextResponse.json({ message: err.message || "Błąd serwera" }, { status: err.status || 500 });
  }
}
