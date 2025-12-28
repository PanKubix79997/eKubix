import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, surname, role, login, password, school, subjects, class: studentClass } = body;

    if (!name || !surname || !role || !login || !password || !school) {
      return NextResponse.json({ message: "Wypełnij wszystkie wymagane pola" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    // Sprawdź, czy login już istnieje
    const existing = await db.collection("users").findOne({ login });
    if (existing) {
      return NextResponse.json({ message: "Login już istnieje" }, { status: 400 });
    }

    // Tworzymy dokument użytkownika
    const newUser: any = {
      name,
      surname,
      role,
      login,
      password,
      school,
      createdAt: new Date(),
    };

    // Jeżeli student, dodaj dodatkowe pola
    if (role === "student") {
      newUser.subjects = Array.isArray(subjects) ? subjects : [];
      newUser.class = studentClass || "";
    }

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: "Użytkownik dodany pomyślnie", userId: result.insertedId }, { status: 200 });

  } catch (err) {
    console.error("Błąd w /api/admin/users/add:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}
